
function SearchResult(documentName, posInDocument, lineContainingMatch)
{
	this.documentName = documentName;
	this.posInDocument = posInDocument;
	this.lineContainingMatch = lineContainingMatch;
}

{
	SearchResult.prototype.toString = function()
	{
		return this.documentName 
		+ " - " + this.posInDocument.toString() 
		+ " - " + this.lineContainingMatch;
	}
}
