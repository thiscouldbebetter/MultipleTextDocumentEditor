class ArrayHelper
{
	static addLookups(array, keyName)
	{
		for (var i = 0; i < array.length; i++)
		{
			var element = array[i];
			var key = element[keyName];
			array[key] = element;
		}

		return array;
	}

	static remove(array, elementToRemove)
	{
		array.splice(this.indexOf(elementToRemove), 1);
		return array;
	}
}
