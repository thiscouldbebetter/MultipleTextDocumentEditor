
function Document(name, contents)
{
	this.name = name;
	this.contents = contents;

	this.cursorPos = new Coords(0, 0);
}

{
	// static methods

	Document.stringAndCharOffsetToCursorPos = function(text, cursorOffsetInChars)
	{
		var newline = "\n";
		var newlinesSoFar = 0;
		var offsetCurrent = null;

		while (true)
		{
			var offsetOfNewline = text.indexOf(newline, offsetCurrent);
			if (offsetOfNewline == -1 || offsetOfNewline >= cursorOffsetInChars)
			{
				break;
			}
			offsetCurrent = offsetOfNewline + 1;
			newlinesSoFar++;
		}

		var returnValue = new Coords
		(
			cursorOffsetInChars - offsetCurrent,
			newlinesSoFar
		);

		return returnValue;
	}

	Document.stringAndCursorPosToCharOffset = function(text, cursorPos)
	{
		var newline = "\n";
		var newlinesSoFar = 0;
		var offsetCurrent = null;
	
		while (offsetCurrent < text.length && newlinesSoFar < cursorPos.y - 1)
		{
			var offsetOfNewline = text.indexOf(newline, offsetCurrent);
			offsetCurrent = offsetOfNewline + 1;
			newlinesSoFar++;
		}

		var returnValue = offsetCurrent + cursorPos.x - 1;

		return returnValue;
	}

}
