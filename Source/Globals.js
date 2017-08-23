
function Globals()
{
	// do nothing
}

{
	Globals.Instance = new Globals();

	Globals.prototype.initialize = function(project)
	{
		this.session = new Session(project);
		this.domUpdate();
	}

	// dom 
	
	Globals.prototype.domUpdate = function()
	{
		this.session.domUpdate();	
	}
}
