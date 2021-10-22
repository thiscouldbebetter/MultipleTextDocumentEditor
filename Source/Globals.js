
class Globals
{
	static Instance = new Globals();

	initialize(project)
	{
		this.session = new Session(project);
		this.domUpdate();
	}

	// dom 

	domUpdate()
	{
		this.session.domUpdate();
	}
}
