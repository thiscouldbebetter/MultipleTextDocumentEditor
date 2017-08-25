
function Project(name, documents)
{
	this.name = name;
	this.documents = documents.addLookups("name");

	if (this.documents.length > 0)
	{
		this.documentIndexSelected = 0;
	}

	this.searchResults = [];
}

{
	Project.prototype.documentAdd = function(documentToAdd)
	{
		this.documents.push(documentToAdd);
		this.documents[documentToAdd.name] = documentToAdd;
		this.documentIndexSelected = this.documents.length - 1;
	}

	Project.prototype.documentNew = function()
	{
		var documentNew = new Document("Untitled.txt", "");
		this.documentAdd(documentNew);
	}

	Project.prototype.documentRemove = function(documentToRemove)
	{
		this.documents.remove(documentToRemove);
		delete this.documents[documentToRemove.name];
		if (this.documents.length == 0)
		{
			this.documentIndexSelected = null;
		}
	}

	Project.prototype.documentSelected = function()
	{
		return (this.documentIndexSelected == null ? null : this.documents[this.documentIndexSelected]);
	}

	Project.prototype.documentsAllRevert = function()
	{
		for (var i = 0; i < this.documents.length; i++)
		{
			var document = this.documents[i];
			document.contentsRevertToSaved();
		}
	}

	Project.prototype.documentsAllSave = function()
	{
		for (var i = 0; i < this.documents.length; i++)
		{
			var document = this.documents[i];
			document.contentsSave();
		}
	}

	Project.prototype.documentsModified = function()
	{
		var returnValue = false;
		for (var i = 0; i < this.documents.length; i++)
		{
			var document = this.documents[i];
			if (document.isModified() == true)
			{
				returnValue = true;
			}
		}

		return returnValue;
	}

	Project.prototype.searchForText = function(textToSearchFor, matchCase)
	{
		this.searchResults.length = 0;

		if (matchCase == false)
		{
			textToSearchFor = textToSearchFor.toLowerCase();
		}

		for (var i = 0; i < this.documents.length; i++)
		{
			var documentToSearch = this.documents[i];
			var documentContents = documentToSearch.contents;

			if (matchCase == false)
			{
				documentContents = documentContents.toLowerCase();
			}

			var indexOfMatchInContents = -1;
			while (true)
			{
				indexOfMatchInContents = documentContents.indexOf
				(
					textToSearchFor,
					indexOfMatchInContents + 1
				);

				if (indexOfMatchInContents >= 0)
				{
					var matchPos = Document.stringAndCharOffsetToCursorPos
					(
						documentContents,
						indexOfMatchInContents
					);

					var newline = "\n";

					var lineWithMatchStart = documentContents.lastIndexOf(newline, indexOfMatchInContents);
					var lineWithMatchEnd = documentContents.indexOf(newline, indexOfMatchInContents);

					if (lineWithMatchStart == -1)
					{
						lineWithMatchStart = 0;
					}

					if (lineWithMatchEnd == -1)
					{
						lineWithMatchEnd = null;
					}

					var lineWithMatch = documentToSearch.contents.substring 
					(
						// Not the same as ".substr"!
						lineWithMatchStart, lineWithMatchEnd
					);

					var result = new SearchResult
					(
						documentToSearch.name, 
						matchPos,
						lineWithMatch
					)
					this.searchResults.push(result);
				}
				else
				{
					break;
				}
			}
		}
	}

	// dom

	Project.prototype.domUpdate = function()
	{
		var inputProjectName = 
			document.getElementById("inputProjectName");

		inputProjectName.value = this.name;

		var selectDocumentsInProject = 
			document.getElementById("selectDocumentsInProject");

		selectDocumentsInProject.options.length = 0;

		for (var i = 0; i < this.documents.length; i++)
		{
			var _document = this.documents[i];
			var documentAsOption = document.createElement("option");
			documentAsOption.innerHTML = _document.name;
			selectDocumentsInProject.appendChild(documentAsOption);
		}

		var documentSelected = this.documentSelected();

		var inputDocumentSelectedName = 
			document.getElementById("inputDocumentSelectedName");
		var textareaDocumentSelectedContents = 
			document.getElementById("textareaDocumentSelectedContents");

		if (documentSelected == null)
		{
			inputDocumentSelectedName.value = "";
			textareaDocumentSelectedContents.value = "";
		}
		else
		{
			selectDocumentsInProject.selectedIndex = 
				this.documentIndexSelected;
			inputDocumentSelectedName.value = 
				documentSelected.name;
			textareaDocumentSelectedContents.value 
				= documentSelected.contents;
		}

		this.domUpdate_Cursor();

		this.domUpdate_Search();
	}

	Project.prototype.domUpdate_Cursor = function()
	{
		var inputCursorColumn = 
			document.getElementById("inputCursorColumn");
		var inputCursorRow = 
			document.getElementById("inputCursorRow");

		var documentSelected = this.documentSelected();

		if (documentSelected == null)
		{
			inputCursorRow.value = "";
			inputCursorColumn.value = "";
		}
		else
		{
			inputCursorRow.value = documentSelected.cursorPos.y + 1;
			inputCursorColumn.value = documentSelected.cursorPos.x + 1;
		}
	}

	Project.prototype.domUpdate_Cursor_Place = function()
	{
		var documentSelected = this.documentSelected();

		if (documentSelected != null)
		{
			var cursorOffsetInChars = Document.stringAndCursorPosToCharOffset
			(
				documentSelected.contents,
				documentSelected.cursorPos
			);

			var textareaDocumentSelectedContents = 
				document.getElementById("textareaDocumentSelectedContents");

			textareaDocumentSelectedContents.selectionStart = cursorOffsetInChars; 
			textareaDocumentSelectedContents.selectionEnd = cursorOffsetInChars;
			textareaDocumentSelectedContents.focus();
		}
		
		this.domUpdate_Cursor();
	}

	Project.prototype.domUpdate_Search = function()
	{
		var selectSearchResults = document.getElementById("selectSearchResults");
		selectSearchResults.innerHTML = "";

		for (var i = 0; i < this.searchResults.length; i++)
		{
			var searchResult = this.searchResults[i];
			var searchResultAsOption = document.createElement("option");
			searchResultAsOption.innerHTML = searchResult.toString();
			selectSearchResults.appendChild(searchResultAsOption);
		}
	}

	// tar

	Project.prototype.toTarFile = function()
	{
		var returnValue = TarFile.new();

		for (var i = 0; i < this.documents.length; i++)
		{
			var _document = this.documents[i];

			var documentContentsSaved = _document.contentsSaved;
			var documentContentsSavedAsBytes = ByteHelper.stringUTF8ToBytes
			(
				documentContentsSaved
			);

			var documentAsTarFileEntry = TarFileEntry.fileNew
			(
				_document.name,
				documentContentsSavedAsBytes
			);
			returnValue.entries.push(documentAsTarFileEntry);
		}

		return returnValue;
	}
}
