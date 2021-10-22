
class Coords
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}

	overwriteWith(other)
	{
		this.x = other.x;
		this.y = other.y;
		return this;
	}

	toString()
	{
		return (this.y + 1) + ":" + (this.x + 1);
	}
}
