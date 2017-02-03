/**
 * @file charts_employee.js
 * 
 *  Declare objects and tree map to hold all employee's data
 */

/**
 * Person class constructor
 * 
 * @param aName
 * @param imgPath
 * @param aRole
 * @returns object reference
 */
function Employee(aName, imgPath, aRole)
{
	this.name = aName;
	this.img = imgPath;
	this.role = aRole;
	this.manager = null;
	this.managerName = "";
	this.childArray = new Array();

	this.addChild = function(refEmployee)
	{
		this.childArray.push(refEmployee);
	};

	this.addManager = function(refManager)
	{
		this.manager = refManager;
	};
}

/**
 * Person map class used to store references to person objects with parent/child
 * relationship. This way it is possible to use recursive functions to pass
 * through the whole map.
 */
function EmployeeMap()
{
	/**
	 * Add reference for new person into an object property. The update its
	 * manager child list and the pointer to manager itself.
	 */
	this.addEmployee = function(refEmployee, managerName)
	{
		writeDebug("Add person " + refEmployee.name + " manager " + managerName);
		this[refEmployee.name] = refEmployee;
		if (managerName == "")
		{
			this.CEO = refEmployee;
			writeDebug(refEmployee.name + " is the CEO !");
		}
		else
		{
			var managerObject = this[managerName];
			refEmployee.addManager(managerObject);
			managerObject.addChild(refEmployee);
			writeDebug("Added " + managerObject.name + " as " + refEmployee.name
					+ " manager");
		}
	};

	this.getEmployee = function(personName)
	{
		return this[personName];
	};
}
