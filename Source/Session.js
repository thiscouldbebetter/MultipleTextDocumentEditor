

function Session(project)
{
	this.project = project;
}

{
	// dom

	Session.prototype.domUpdate = function()
	{
		this.project.domUpdate();
	}
}
