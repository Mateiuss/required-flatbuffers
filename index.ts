import * as fb from 'flatbuffers';
import { RequiredSchema } from './gen/required-schema';
import { NonRequiredSchema } from './gen/non-required-schema'

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

function print_and_return_array(builder: fb.Builder, schema: fb.Offset): Uint8Array {
    builder.finish(schema);
    let buff = builder.asUint8Array();
    console.log("The serialized data seen with hexdump:");
    console.log(hexDump(Buffer.from(buff)));

    return buff;
}


/* Helper functions for printing an array in a hexdump-like manner */
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

/* Serializing a required and a non-required schema with a missing field */
console.log("Serializing the non-required schema");
let non_required_schema = serialize_non_required_schema(builder, id);
let non_required_buffer = print_and_return_array(builder, non_required_schema);

console.log("Serializing the required schema");
try {
    let required_schema = serialize_required_schema(builder, id);
    print_and_return_array(builder, required_schema);
} catch {
    console.log("Couldn't serialize data because of the missing required field\n");
}

/* Deserializing both a required and a non-required schema from the non_required_buffer */
let buf = new fb.ByteBuffer(non_required_buffer);

console.log("Deserializing the non-required schema:");
let des_non_req_schema = NonRequiredSchema.getRootAsNonRequiredSchema(buf);
console.log("The name is " + des_non_req_schema.name());
console.log("The id is " + des_non_req_schema.id() + "\n");

console.log("Deserializing the required schema:");
let des_req_schema = RequiredSchema.getRootAsRequiredSchema(buf);
console.log("The name is " + des_req_schema.name());
console.log("The id is " + des_req_schema.id());
