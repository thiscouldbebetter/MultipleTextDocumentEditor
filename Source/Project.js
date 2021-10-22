
class Project
{
	constructor(name, documents)
	{
		this.name = name;
		this.documents = ArrayHelper.addLookups(documents, "name");

		if (this.documents.length > 0)
		{
			this.documentIndexSelected = 0;
		}

		this.searchResults = [];
	}

	documentAdd(documentToAdd)
	{
		this.documents.push(documentToAdd);
		this.documents[documentToAdd.name] = documentToAdd;
		this.documentIndexSelected = this.documents.length - 1;
	}

	documentNew()
	{
		var documentNew =
			new TextDocument("Untitled.txt", "");
		this.documentAdd(documentNew);
	}

	documentRemove(documentToRemove)
	{
		this.documents.remove(documentToRemove);
		delete this.documents[documentToRemove.name];
		if (this.documents.length == 0)
		{
			this.documentIndexSelected = null;
		}
	}

	documentSelected()
	{
		var returnValue =
		(
			this.documentIndexSelected == null
			? null
			: this.documents[this.documentIndexSelected]
		);
		return returnValue;
	}

	documentsAllRevert()
	{
		for (var i = 0; i < this.documents.length; i++)
		{
			var document = this.documents[i];
			document.contentsRevertToSaved();
		}
	}

	documentsAllSave()
	{
		for (var i = 0; i < this.documents.length; i++)
		{
			var document = this.documents[i];
			document.contentsSave();
		}
	}

	documentsModified()
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

	searchForText(textToSearchFor, matchCase)
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
					var matchPos = TextDocument.stringAndCharOffsetToCursorPos
					(
						documentContents,
						indexOfMatchInContents
					);

					var newline = "\n";

					var lineWithMatchStart =
						documentContents.lastIndexOf(newline, indexOfMatchInContents);
					var lineWithMatchEnd =
						documentContents.indexOf(newline, indexOfMatchInContents);

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

	domUpdate()
	{
		var d = document;

		var inputProjectName = 
			d.getElementById("inputProjectName");

		inputProjectName.value = this.name;

		var selectDocumentsInProject = 
			d.getElementById("selectDocumentsInProject");

		selectDocumentsInProject.options.length = 0;

		for (var i = 0; i < this.documents.length; i++)
		{
			var _document = this.documents[i];
			var documentAsOption = d.createElement("option");
			documentAsOption.innerHTML = _document.name;
			selectDocumentsInProject.appendChild(documentAsOption);
		}

		var documentSelected = this.documentSelected();

		var inputDocumentSelectedName = 
			d.getElementById("inputDocumentSelectedName");
		var textareaDocumentSelectedContents = 
			d.getElementById("textareaDocumentSelectedContents");

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

	domUpdate_Cursor()
	{
		var d = document;

		var inputCursorColumn = 
			d.getElementById("inputCursorColumn");
		var inputCursorRow = 
			d.getElementById("inputCursorRow");

		var documentSelected = this.documentSelected();

		if (documentSelected == null)
		{
			inputCursorRow.value = "";
			inputCursorColumn.value = "";
		}
		else
		{
			inputCursorRow.value =
				documentSelected.cursorPos.y + 1;
			inputCursorColumn.value =
				documentSelected.cursorPos.x + 1;
		}
	}

	domUpdate_Cursor_Place()
	{
		var documentSelected = this.documentSelected();

		if (documentSelected != null)
		{
			var cursorOffsetInChars =
				TextDocument.stringAndCursorPosToCharOffset
				(
					documentSelected.contents,
					documentSelected.cursorPos
				);

			var d = document;
			var textareaDocumentSelectedContents = 
				d.getElementById("textareaDocumentSelectedContents");

			textareaDocumentSelectedContents.selectionStart =
				cursorOffsetInChars; 
			textareaDocumentSelectedContents.selectionEnd =
				cursorOffsetInChars;
			textareaDocumentSelectedContents.focus();
		}

		this.domUpdate_Cursor();
	}

	domUpdate_Search()
	{
		var d = document;

		var selectSearchResults =
			d.getElementById("selectSearchResults");
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

	toTarFile()
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
