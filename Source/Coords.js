
function Coords(x, y)
{
	this.x = x;
	this.y = y;
}

{
	Coords.prototype.overwriteWith = function(other)
	{
		this.x = other.x;
		this.y = other.y;
		return this;
	}

	Coords.prototype.toString = function()
	{
		return (this.y + 1) + ":" + (this.x + 1);
	}
}
