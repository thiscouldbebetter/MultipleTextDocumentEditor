
function TarFileEntryHeader
(
	fileName,
	fileMode,
	userIDOfOwner,
	userIDOfGroup,
	fileSizeInBytes,
	timeModifiedInUnixFormat,
	checksum,
	typeFlag,
	nameOfLinkedFile,
	uStarIndicator,
	uStarVersion,
	userNameOfOwner,
	groupNameOfOwner,
	deviceNumberMajor,
	deviceNumberMinor,
	filenamePrefix
)
{
	this.fileName = fileName;
	this.fileMode = fileMode;
	this.userIDOfOwner = userIDOfOwner;
	this.userIDOfGroup = userIDOfGroup;
	this.fileSizeInBytes = fileSizeInBytes;
	this.timeModifiedInUnixFormat = timeModifiedInUnixFormat;
	this.checksum = checksum;
	this.typeFlag = typeFlag;
	this.nameOfLinkedFile = nameOfLinkedFile;
	this.uStarIndicator = uStarIndicator;
	this.uStarVersion = uStarVersion;
	this.userNameOfOwner = userNameOfOwner;
	this.groupNameOfOwner = groupNameOfOwner;
	this.deviceNumberMajor = deviceNumberMajor;
	this.deviceNumberMinor = deviceNumberMinor;
	this.filenamePrefix = filenamePrefix;
}

{
	TarFileEntryHeader.SizeInBytes = 500;

	// static methods

	TarFileEntryHeader.default = function()
	{
		var now = new Date();
		var unixEpoch = new Date(1970, 1, 1);
		var millisecondsSinceUnixEpoch = now - unixEpoch;
		var secondsSinceUnixEpoch = Math.floor
		(
			millisecondsSinceUnixEpoch / 1000
		);
		var secondsSinceUnixEpochAsStringOctal = 
			secondsSinceUnixEpoch.toString(8).padRight(12, " ");
		var timeModifiedInUnixFormat = []; 
		for (var i = 0; i < secondsSinceUnixEpochAsStringOctal.length; i++)
		{
			var digitAsASCIICode = 
				secondsSinceUnixEpochAsStringOctal.charCodeAt(i);
			timeModifiedInUnixFormat.push(digitAsASCIICode);
		}

		var returnValue = new TarFileEntryHeader
		(
			"".padRight(100, "\0"), // fileName
			"100777 \0", // fileMode
			"0 \0".padLeft(8, " "), // userIDOfOwner
			"0 \0".padLeft(8, " "), // userIDOfGroup
			0, // fileSizeInBytes
			timeModifiedInUnixFormat,
			0, // checksum
			TarFileTypeFlag.Instances.Normal,
			"".padRight(100, "\0"), // nameOfLinkedFile,
			"".padRight(6, "\0"), // uStarIndicator,
			"".padRight(2, "\0"), // uStarVersion,
			"".padRight(32, "\0"), // userNameOfOwner,
			"".padRight(32, "\0"), // groupNameOfOwner,
			"".padRight(8, "\0"), // deviceNumberMajor,
			"".padRight(8, "\0"), // deviceNumberMinor,
			"".padRight(155, "\0") // filenamePrefix
		);

		return returnValue;
	}

	TarFileEntryHeader.directoryNew = function(directoryName)
	{
		var header = TarFileEntryHeader.default();
		header.fileName = directoryName;
		header.typeFlag = TarFileTypeFlag.Instances.Directory;
		header.fileSizeInBytes = 0;
		header.checksumCalculate();

		return header;
	}

	TarFileEntryHeader.fileNew = function(fileName, fileContentsAsBytes)
	{
		var header = TarFileEntryHeader.default();
		header.fileName = fileName;
		header.typeFlag = TarFileTypeFlag.Instances.Normal;
		header.fileSizeInBytes = fileContentsAsBytes.length;
		header.checksumCalculate();

		return header;
	}

	TarFileEntryHeader.fromBytes = function(bytes)
	{
		var reader = new ByteStream(bytes);

		var fileName = reader.readString(100).trim();
		var fileMode = reader.readString(8);
		var userIDOfOwner = reader.readString(8);
		var userIDOfGroup = reader.readString(8);
		var fileSizeInBytesAsStringOctal = reader.readString(12);
		var timeModifiedInUnixFormat = reader.readBytes(12);
		var checksumAsStringOctal = reader.readString(8);
		var typeFlagValue = reader.readString(1);
		var nameOfLinkedFile = reader.readString(100);
		var uStarIndicator = reader.readString(6);
		var uStarVersion = reader.readString(2);
		var userNameOfOwner = reader.readString(32);
		var groupNameOfOwner = reader.readString(32);
		var deviceNumberMajor = reader.readString(8);
		var deviceNumberMinor = reader.readString(8);
		var filenamePrefix = reader.readString(155);
		var reserved = reader.readBytes(12);

		var fileSizeInBytes = parseInt
		(
			fileSizeInBytesAsStringOctal.trim(), 8
		);

		var checksum = parseInt
		(
			checksumAsStringOctal, 8
		);

		var typeFlags = TarFileTypeFlag.Instances._All;
		var typeFlagID = "_" + typeFlagValue;
		var typeFlag = typeFlags[typeFlagID];

		var returnValue = new TarFileEntryHeader
		(
			fileName,
			fileMode,
			userIDOfOwner,
			userIDOfGroup,
			fileSizeInBytes,
			timeModifiedInUnixFormat,
			checksum,
			typeFlag,
			nameOfLinkedFile,
			uStarIndicator,
			uStarVersion,
			userNameOfOwner,
			groupNameOfOwner,
			deviceNumberMajor,
			deviceNumberMinor,
			filenamePrefix
		);

		return returnValue;
	}

	// instance methods

	TarFileEntryHeader.prototype.checksumCalculate = function()
	{
		var thisAsBytes = this.toBytes();

		// The checksum is the sum of all bytes in the header,
		// except we obviously can't include the checksum itself.
		// So it's assumed that all 8 of checksum's bytes are spaces (0x20=32).
		// So we need to set this manually.

		var offsetOfChecksumInBytes = 148;
		var numberOfBytesInChecksum = 8;
		var presumedValueOfEachChecksumByte = " ".charCodeAt(0);
		for (var i = 0; i < numberOfBytesInChecksum; i++)
		{
			var offsetOfByte = offsetOfChecksumInBytes + i;
			thisAsBytes[offsetOfByte] = presumedValueOfEachChecksumByte;
		}

		var checksumSoFar = 0;

		for (var i = 0; i < thisAsBytes.length; i++)
		{
			var byteToAdd = thisAsBytes[i];
			checksumSoFar += byteToAdd;
		}

		this.checksum = checksumSoFar;

		return this.checksum;
	}

	TarFileEntryHeader.prototype.toBytes = function()
	{
		var headerAsBytes = [];
		var writer = new ByteStream(headerAsBytes);

		var fileSizeInBytesAsStringOctal = (this.fileSizeInBytes.toString(8) + " ").padLeft(12, " ")
		var checksumAsStringOctal = (this.checksum.toString(8) + " \0").padLeft(8, " ");

		writer.writeString(this.fileName, 100);
		writer.writeString(this.fileMode, 8);
		writer.writeString(this.userIDOfOwner, 8);
		writer.writeString(this.userIDOfGroup, 8);
		writer.writeString(fileSizeInBytesAsStringOctal, 12);
		writer.writeBytes(this.timeModifiedInUnixFormat);
		writer.writeString(checksumAsStringOctal, 8);
		writer.writeString(this.typeFlag.value, 1);
		writer.writeString(this.nameOfLinkedFile, 100);
		writer.writeString(this.uStarIndicator, 6);
		writer.writeString(this.uStarVersion, 2);
		writer.writeString(this.userNameOfOwner, 32);
		writer.writeString(this.groupNameOfOwner, 32);
		writer.writeString(this.deviceNumberMajor, 8);
		writer.writeString(this.deviceNumberMinor, 8);
		writer.writeString(this.filenamePrefix, 155);
		writer.writeString("".padRight(12, "\0")); // reserved

		return headerAsBytes;
	}

	// strings

	TarFileEntryHeader.prototype.toString = function()
	{
		var newline = "\n";

		var returnValue = 
			"[TarFileEntryHeader "
			+ "fileName='" + this.fileName + "' "
			+ "typeFlag='" + (this.typeFlag == null ? "err" : this.typeFlag.name) + "' "
			+ "fileSizeInBytes='" + this.fileSizeInBytes + "' "
			+ "]"
			+ newline;

		return returnValue;
	}
}
