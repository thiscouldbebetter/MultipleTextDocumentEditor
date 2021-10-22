
class SearchResult
{
	constructor(documentName, posInDocument, lineContainingMatch)
	{
		this.documentName = documentName;
		this.posInDocument = posInDocument;
		this.lineContainingMatch = lineContainingMatch;
	}

	toString()
	{
		return this.documentName 
			+ " - " + this.posInDocument.toString() 
			+ " - " + this.lineContainingMatch;
	}
}
