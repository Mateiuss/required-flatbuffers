import * as fb from 'flatbuffers';
import { RequiredSchema } from './gen/required-schema';
import { NonRequiredSchema } from './gen/non-required-schema'
import { stdout } from 'process';

function init_builder() {
    return new fb.Builder(1024);
}

function serialize_required_schema(builder: fb.Builder, id: number): fb.Offset {
    RequiredSchema.startRequiredSchema(builder);
    RequiredSchema.addId(builder, id);
    return RequiredSchema.endRequiredSchema(builder);
}

function serialize_non_required_schema(builder: fb.Builder, id: number): fb.Offset {
    NonRequiredSchema.startNonRequiredSchema(builder);
    NonRequiredSchema.addId(builder, id);
    return NonRequiredSchema.endNonRequiredSchema(builder);
}

function print_array(builder: fb.Builder, schema: fb.Offset) {
    builder.finish(schema);
    let buff = builder.asUint8Array();
    stdout.write(hexDump(Buffer.from(buff)) + "\n");
}

function printValue(value: number): string {
    if (value >= 0x20 && value <= 0x7e) {
      return String.fromCharCode(value);
    } else {
      return '.';
    }
  }

function hexDump(buff: Buffer): string {
    let x = 0;

    let lineHex = '';
    let lineAscii = '';

    let ret = '';

    let offset = 0;

    for (const value of buff) {
        lineHex += value.toString(16).padStart(2, '0') + ' ';
        lineAscii += printValue(value);

        x += 1;

        if (x > 16) {
        ret += `${offset
            .toString(16)
            .padStart(8, '0')} | ${lineHex.trim()} | ${lineAscii}\n`;

        lineHex = '';
        lineAscii = '';

        x = 0;

        offset += 16;
        }
    }

    ret += `${offset.toString(16).padStart(8, '0')} | ${lineHex
        .trim()
        .padEnd(3 * 16 + 2, ' ')} | ${lineAscii}\n`;

    return ret;
}

let builder = init_builder()
let id = 97;

let non_required_schema = serialize_non_required_schema(builder, id);
print_array(builder, non_required_schema);

try {
    let required_schema = serialize_required_schema(builder, id);
    print_array(builder, required_schema);
} catch {
    stdout.write("Couldn't serialize data because of the missing required field\n");
}
