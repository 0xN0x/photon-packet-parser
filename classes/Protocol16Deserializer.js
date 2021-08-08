
class Protocol16Deserializer {
	static protocol16Type = require('../enumerations/Protocol16Type.json');

	static deserialize(input, typeCode) {
		switch (typeCode) {
			case this.protocol16Type.Unknown:
			case this.protocol16Type.Null:
				return null;
			case this.protocol16Type.Dictionary:
				return this.deserializeDictionary(input);
			case this.protocol16Type.StringArray:
				return this.deserializeStringArray(input);
			case this.protocol16Type.Byte:
				return input.readUInt8();
			case this.protocol16Type.Double:
				return this.deserializeDouble(input);
			case this.protocol16Type.EventData:
				return this.deserializeEventData(input);
			case this.protocol16Type.Float:
				return this.deserializeFloat(input);
			case this.protocol16Type.Integer:
				return input.readUInt32BE();
			case this.protocol16Type.Hashtable:
				return this.deserializeHashtable(input);
			case this.protocol16Type.Short:
				return this.deserializeShort(input);
			case this.protocol16Type.Long:
				return this.deserializeLong(input);
			case this.protocol16Type.IntegerArray:
				return this.deserializeIntArray(input);
			case this.protocol16Type.Boolean:
				return this.deserializeBoolean(input);
			case this.protocol16Type.OperationResponse:
				return this.deserializeOperationResponse(input);
			case this.protocol16Type.OperationRequest:
				return this.deserializeOperationRequest(input);
			case this.protocol16Type.String:
				return this.deserializeString(input);
			case this.protocol16Type.ByteArray:
				return this.deserializeByteArray(input);
			case this.protocol16Type.Array:
				return this.deserializeArray(input);
			case this.protocol16Type.ObjectArray:
				return this.deserializeObjectArray(input);
			default:
				throw new Error(`Type code: ${typeCode} not implemented.`);
		}
	}

	static deserializeShort(input) {
		return input.readUInt16BE();
	}

	static deserializeBoolean(input) {
		return input.readUInt8() != 0;
	}

	static deserializeLong(input) {
		const res = input.buffer.readBigInt64BE(input.tell());
		input.seek(input.tell() + 8);

		return res;
	}

	static deserializeFloat(input) {
		return input.readFloatBE();
	}

	static deserializeString(input) {
		const stringSize = this.deserializeShort(input);
		if (stringSize === 0) return "";

		const res = input.toString('utf8', stringSize);

		return res;
	}

	static deserializeArray(input) {
		const size = this.deserializeShort(input);
		const typeCode = input.readUInt8();
		const res = [];

		switch(typeCode) {
			case this.protocol16Type.Array:
				break;
			case this.protocol16Type.ByteArray:
				break;
			case this.protocol16Type.Dictionary:
				break;
			default:
				for (let i = 0; i < size; i++) {
					res.push(this.deserialize(input, typeCode));
				}
				break;
		}

		return res;
	}

	static deserializeByteArray(input) {
		const arraySize = input.readUInt32BE();

		return input.slice(arraySize);
	}

	static deserializeDictionary(input) {
		const keyTypeCode = input.readUInt8();
		const valueTypeCode = input.readUInt8();
		const dictionnarySize = this.deserializeShort(input);
		let output = {};

		for (let i = 0; i < dictionnarySize; i++) {
			const key = this.deserialize(input, (keyTypeCode == 0 || keyTypeCode == 42) ? input.readUInt8() : keyTypeCode);
			const value = this.deserialize(input, (valueTypeCode == 0 || valueTypeCode == 42) ? input.readUInt8() : valueTypeCode);
			output[key] = value;
		}

		return output;
	}

	static deserializeEventData(input) {
		const code = input.readUInt8();
		const parameters = this.deserializeParameterTable(input);
		
		return {code, parameters};
	}

	static deserializeParameterTable(input) {
		const tableSize = input.readUInt16BE(1);
		let table = {};
		let offset = 3;

		for (let i = 0; i < tableSize; i++) {
			const key = input.readUInt8(offset);
			const valueTypeCode = input.readUInt8(offset + 1);

			const value = this.deserialize(input, valueTypeCode)

			table[key] = value;
		}

		return table;
	}
}

module.exports = Protocol16Deserializer;