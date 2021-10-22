
class TextDocument
{
	constructor(name, contents)
	{
		this.name = name;
		this.contents = contents;

		this.cursorPos = new Coords(0, 0);
		this.contentsSave();
	}

	// static methods

	static stringAndCharOffsetToCursorPos(text, cursorOffsetInChars)
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

	static stringAndCursorPosToCharOffset(text, cursorPos)
	{
		var newline = "\n";
		var newlinesSoFar = 0;
		var offsetCurrent = null;

		while (offsetCurrent < text.length && newlinesSoFar < cursorPos.y)
		{
			var offsetOfNewline = text.indexOf(newline, offsetCurrent);
			offsetCurrent = offsetOfNewline + 1;
			newlinesSoFar++;
		}

		var returnValue = offsetCurrent + cursorPos.x;

		return returnValue;
	}

	// instance methods

	contentsRevertToSaved()
	{
		this.contents = this.contentsSaved;
	}

	contentsSave()
	{
		this.contentsSaved = this.contents;
	}

	isModified()
	{
		return (this.contents != this.contentsSaved);
	}

}
