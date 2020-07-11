//Budget Controller
var budgetController = (function () {
    //Some coding,but later
    var Expenses = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;

        data.allitems[type].forEach(function (curr) {
            sum += curr.value;

            data.totals[type] = sum;
        });

    };

    var data = {
        allitems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: 0
    };
    return {
        additem: function (type, desc, val) {
            var dataobj, ID;
            //create id - id will be the last item of the array + 1 
            if (data.allitems[type].length > 0) {
                ID = (data.allitems[type][data.allitems[type].length - 1].id) + 1;
            } else {
                ID = 0;
            }
            //Create new item
            if (type === 'exp') {
                dataobj = new Expenses(ID, desc, val);
            } else if (type === 'inc') {
                dataobj = new Income(ID, desc, val);
            }

            //push that item in data object
            data.allitems[type].push(dataobj);

            //Return the newly created item
            return dataobj;
        },

        deleteItem: function (type, id) {
            var ids;
            ids = data.allitems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allitems[type].splice(index, 1);
            }
        },
        CalculateBudget: function () {
            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        sendBudget: function () {
            return {
                budget: data.budget,
                totalinc: data.totals.inc,
                totalexp: data.totals.exp,
                percent: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    };


})();
//UI Controller
var UIController = (function () {
    //Creating a place for all css strings
    var Domstrings = {
        Inputtype: '.add__type',
        Inputdescription: '.add__description',
        Inputvalue: '.add__value',
        Inputbutton: '.add__btn',
        Incomediv: '.income__list',
        Expensesdiv: '.expenses__list',
        budgetlabel: '.budget__value',
        expeneselabel: '.budget__expenses--value',
        incomelabel: '.budget__income--value',
        percentlabel: '.budget__expenses--percentage',
        container: '.container'
    };
    return {
        getInput: function () {
            return {
                type: document.querySelector(Domstrings.Inputtype).value,
                description: document.querySelector(Domstrings.Inputdescription).value,
                value: parseFloat(document.querySelector(Domstrings.Inputvalue).value)
            };
        },
        additem: function (obj, type) {
            var html, newhtml, element;
            //Create placeholder with HTML
            if (type === 'inc') {
                element = Domstrings.Incomediv;
                html = `<div class="item clearfix" id="inc-%id%">
                        <div class="item__description">%description%</div>
                        <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`
            }
            else if (type === 'exp') {
                element = Domstrings.Expensesdiv;
                html = `<div class="item clearfix" id="exp-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                            <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                            </div>
                        </div>`
            }

            // Replace the above placeholder text with actual data
            newhtml = html.replace('%id%', obj.id);
            newhtml = newhtml.replace('%description%', obj.description);
            newhtml = newhtml.replace('%value%', obj.value);

            //Display into HTML Using DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
        },
        deleteitem: function (selectorID) {
            var el;

            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        cleardetails: function () {
            var fields, fieldsarr;

            fields = document.querySelectorAll(Domstrings.Inputdescription + ', ' + Domstrings.Inputvalue);

            fieldsarr = Array.prototype.slice.call(fields);
            fieldsarr.forEach(function (current, index, Array) {
                current.value = "";

                fieldsarr[0].focus();
            });
        },

        displayBudget: function (obj) {
            document.querySelector(Domstrings.budgetlabel).textContent = obj.budget;
            document.querySelector(Domstrings.incomelabel).textContent = obj.totalinc;
            document.querySelector(Domstrings.expeneselabel).textContent = obj.totalexp;
            if (obj.percent > 0) {
                document.querySelector(Domstrings.percentlabel).textContent = obj.percent;
            } else {
                document.querySelector(Domstrings.percentlabel).textContent = "---";
            }


        },

        getDOMStrings: function () {
            return Domstrings;
        }
    };
})();
//Global App Contorller
var Controller = (function (BudCont, UiCont) {
    var setupEventhandler = function () {
        var DOM = UiCont.getDOMStrings();
        // Adding an eventlistner when clicked
        document.querySelector(DOM.Inputbutton).addEventListener('click', ctrlAddItem);


        // Adding an eventlistner when pressed enter
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {//checks if the entered is pressed by checking the keycode property of keyboard event 
                ctrlAddItem();
            }
            document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        });
    }

    var ctrlAddItem = function () {
        var Input, newItem;

        //Get input from user
        Input = UiCont.getInput();

        //Add item to the list
        newItem = BudCont.additem(Input.type, Input.description, Input.value);
        if (Input.description != "" && !isNaN(Input.value) && Input.value > 0) {
            //Add item to UI
            UiCont.additem(newItem, Input.type);

            //Clearing items from input fields
            UiCont.cleardetails();

            updateBudget();
        }
    };
    var updateBudget = function () {
        var budget;
        //calculate te budget
        BudCont.CalculateBudget();


        //Get the budget
        budget = BudCont.sendBudget();

        //Display the budget
        UiCont.displayBudget(budget);
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        //console.log(itemID);
        if (itemID) {
            splitID = itemID.split('-');
            console.log(splitID);
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //Delete item from the DS
            BudCont.deleteItem(type, ID);

            //Delete item from the UI
            UiCont.deleteitem(itemID);

            //Show the new budget
            updateBudget();
        }
    };


    return {
        init: function () {
            console.log('Application has started');
            setupEventhandler();
        }
    };
})(budgetController, UIController);

Controller.init();