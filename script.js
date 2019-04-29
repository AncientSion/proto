const classes = {
	Unit: class Unit {
		constructor(name, cost, type, hp, pd, soft, hard, evade, mobility, range, parentid = 0, id = 0){
			this.name = name;
			this.cost = cost;
			this.type = type;
			this.hp = hp;
			this.pd = pd;
			this.soft = soft;
			this.hard = hard;
			this.evade = evade;
			this.mobility = mobility;
			this.range = range;
			this.parentid = parentid
			this.id = id;

			this.destroyed = 0;
			this.remHP = hp;
			this.damages = [];
			this.element;

			this.createSingleHTMLElement();
			this.setHealth();
		}

		createSingleHTMLElement(){
			this.element = $("<div>")
			.addClass("unitContainer")
				.data("unitid", this.id)
				.click(function(){
					console.log($(this).data("unitid"));
				})
				.contextmenu(function(e){
					e.preventDefault();
					game.getUnit($(this).closest(".fleetDiv").data("fleetid")).removeUnitById($(this).data("unitid"))
				})
				.append($("<div>").addClass("unittype").html(this.name + " " + this.id))
		/*	.append($("<div>")
				.append($("<div>").html(this.soft))
				.append($("<div>").html(this.hard))
			)
*/
			let healthCon = $("<div>").addClass("healthCon");

			for (let i = 1; i <= this.hp; i++){
				healthCon.append($("<div>").addClass("health"));
			}
			this.element.append(healthCon);
		}

		setHealth(){
			if (this.remHP == this.hp){return;}

			let pips = this.element.find(".health");

			for (let i = pips.length-1; i >= this.remHP; i--){
				$(pips[i]).addClass("lost");
			}
		}

		receiveDamage(amount){
			this.damages.push({amount: amount, turn: game.turn});
			this.remHP -= amount;

			if (this.remHP <= 0){
				this.remHP = 0;
				this.destroyed = game.turn;
			}
		}
	},

	Fleet: class Fleet {
		constructor(id){
			this.id = id;
			this.userid = 1;
			this.friendly = 1;
			this.samples = [];
			this.units = [];
			this.pos;
			this.htmlElement;
			this.idindex = 0;
			this.loc = {x: 0, y: 0};
			this.attack = {x: 0, y: 0};

			this.createElement();
			this.createHoverElement();
		}

		doSelect(){
			if (!this.units.length){return;}
			
			if (!game.activeFleet || game.activeFleet.id != this.id){
				game.activeFleet = this;
				game.mode = 2;
				this.htmlElement.find(".btn").html("active!").addClass("activeFleet");
			}
			else {
				game.mode = 1;
				game.activeFleet = false;
				this.htmlElement.find(".btn").html("select").removeClass("activeFleet");
			}
		}

		changeUserId(){
			this.userid = this.userid == 1 ? this.userid = 2 : this.userid = 1;
			this.friendly = this.userid == game.userid ? 1 : 0;
			this.htmlElement.find(".userid").html(this.userid);
		}

		doPlace(pos){
			this.loc = pos;
			this.doSelect();
			this.updateHoverDiv();
			game.updateCanvas();
		}

		setAttack(pos){
			this.attack = pos;
			game.updateCanvas();
			this.doSelect();
		}

		getUnitId(){
			this.idindex++;
			return this.idindex;
		}

		createHoverElement(){
			this.fleetHoverDiv = $("<div>")
				.addClass("fleetHoverDiv fleet" + this.id + " hidden")
				.append($("<div>")
					.append($("<table>")))
			$(document.body).append(this.fleetHoverDiv);

			this.updateHoverDiv();
		}

		updateHoverDiv(){
			let table = $(this.fleetHoverDiv).find("table").empty()
				.append($("<thead>").append($("<td>").attr("colSpan", 4).html("Fleet #" + this.id)));

			if (!this.units.length){return;}

			let unitNumbers = [];	

			for (let i = 0; i < game.samples.length; i++){
				unitNumbers.push(0);

				for (let j = 0; j < this.units.length; j++){
					if (game.samples[i].name != this.units[j].name){continue;}
				
					unitNumbers[i]++;
				}

				if (unitNumbers[i]){
					table.append($("<tr>")
							.append($("<td>").html(unitNumbers[i]))
							.append($("<td>").attr("colSpan", 3).html(game.samples[i].name)))
				}
			}

			table
				.append($("<tr>").css("height", 20).append($("<td>").attr("colSpan", 4)))
				.append($("<tr>")
					.append($("<td>").html("HP"))
					.append($("<td>").html("PD"))
					.append($("<td>").html("SA"))
					.append($("<td>").html("HA")))
				.append($("<tr>")
					.append($("<td>").html(this.getStat("hp")))
					.append($("<td>").html(this.getStat("pd")))
					.append($("<td>").html(this.getStat("soft")))
					.append($("<td>").html(this.getStat("hard"))))

		}

		getCombinedStats(){
			let hp = this.getStat("hp");
			let pd = this.getStat("pd");			
			let soft = this.getStat("soft");
			let hard = this.getStat("hard");

			return (hp + " / " + pd + " / " + soft + " / " + hard);
		}

		getStat(stat){
			let amount = 0;

			for (let i = 0; i < this.units.length; i++){
				amount += this.units[i][stat];
			}
			return amount;
		}

		toggleHoverElement(){
			$(this.fleetHoverDiv).toggleClass("hidden");
		}

		fireAt(target){

			for (let i = 0; i < this.units.length; i++){
				//	console.log("fleet #" + this.id + ", shooter: " + this.units[i].name + " #" + i + " doing " + this.units[i].soft + " damage"); 
				let subTarget = target.units[Math.floor(Math.random()*target.units.length)];
					subTarget.receiveDamage(this.units[i].soft);
			}
		}

		createElement(){

			var buttonHtml = (this.loc.x != 0 && this.loc.y != 0 ? "select" : "confirm")

			let classTable = $("<table>")
			let thead = $("<thead>")
			.append($("<tr>")
				.append($("<td>").attr("colSpan", 7).html("Fleet #" + this.id))
				.append($("<td>").attr("colSpan", 2)
					.html(this.userid)
					.addClass("userid")
					.click(function(){
						game.getUnit($(this).closest(".fleetDiv").data("fleetid")).changeUserId();
					}))
				.append($("<td>").attr("colSpan", 2)
					.append($("<div>")
						.addClass("btn")
						.html(buttonHtml)
						.click(function(){
							game.getUnit($(this).closest(".fleetDiv").data("fleetid")).doSelect();
						}))));



			let names = ["", "Name", "Cost", "Type", "Health", "PD", "Soft", "Hard", "Evade", "Mobility", "Range"];
			let cols = [];

			for (let i = 0; i < names.length; i++){
				cols.push($("<td>").html(names[i]))
			}

			let row = $("<tr>")
			for (let i = 0; i < cols.length; i++){
				row.append($("<td>").html(cols[i]))
			}
			thead.append(row);
			classTable.append(thead);

			for (let i = 0; i < game.samples.length; i++){
				let tr = $("<tr>")
					.addClass("availableUnit")
					.click(function(e){
						addUnitToFleet(this)
					})
					.contextmenu(function(e){
						e.preventDefault();
						removeUnitFromFleet(this);
					})
					.append($("<td>").html(""))
					.append($("<td>").html(game.samples[i].name))
					.append($("<td>").html(game.samples[i].cost))
					.append($("<td>").html(game.samples[i].type))
					.append($("<td>").html(game.samples[i].hp))
					.append($("<td>").html(game.samples[i].pd))
					.append($("<td>").html(game.samples[i].soft))
					.append($("<td>").html(game.samples[i].hard))
					.append($("<td>").html(game.samples[i].evade))
					.append($("<td>").html(game.samples[i].mobility))
					.append($("<td>").html(game.samples[i].range))

				$(classTable).append(tr);
			}

			$(classTable)
				//.append($("<tr>").css("height", 20).append($("<td>").attr("colSpan", 10)))
				.append($("<tfoot>")
					.append($("<tr>")
						.append($("<td>").html(0))
						.append($("<td>").html(""))
						.append($("<td>").html(0))
						.append($("<td>").html(""))
						.append($("<td>").html(0))
						.append($("<td>").html(0))
						.append($("<td>").html(0))
						.append($("<td>").html(0))
						.append($("<td>").html(""))
						.append($("<td>").html(""))
						.append($("<td>").html(""))))

			this.htmlElement = $("<div>")
				.addClass("fleetDiv").data("fleetid", game.idindex)
				.append($("<div>").addClass("unitTypes").append(classTable))
				.append($("<div>").addClass("fleetLayout"))
				

			$(document.body).append(this.htmlElement);
		}

		addUnit(name){
			var subunit = new classes[name](this.id, this.getUnitId());

			this.units.push(subunit);
			this.htmlElement.find(".fleetLayout").append(subunit.element);

			this.updateTable(name);
			if (this.loc.x || this.loc.y){this.updateHoverDiv();}
		}

		removeUnit(name){
			for (let i = this.units.length-1; i >= 0; i--){
				if (this.units[i].name == name){
					//console.log("removing " + name);
					$(this.units[i].element).remove();
					this.units.splice(i, 1);
					this.updateTable(name);
					return;
				}
			}
		}
		removeUnitById(id){
			for (let i = this.units.length-1; i >= 0; i--){
				if (this.units[i].id == id){
					//console.log("removing " + this.units[i].id);
					$(this.units[i].element).remove();
					this.units.splice(i, 1);
					this.updateTable(name);
					return;
				}
			}
		}

		updateTable(name){
			let amount = [];
			let stats = [0, "", 0, "", 0, 0, 0, 0, "", 10, ""];
			let rows = $(this.htmlElement).find("tr");

			for (var i = 0; i < game.samples.length; i++){
				amount.push(0);

				for (var j = 0; j < this.units.length; j++){
					if (game.samples[i].name == this.units[j].name){
						amount[i]++;
					}
				}
				rows[i+2].childNodes[0].innerHTML = amount[i] ? amount[i] : "";

				stats[0] += amount[i];
				stats[2] += amount[i] * game.samples[i].cost;
				stats[4] += amount[i] * game.samples[i].hp;
				stats[5] += amount[i] * game.samples[i].pd;
				stats[6] += amount[i] * game.samples[i].soft;
				stats[7] += amount[i] * game.samples[i].hard;
				stats[9] =  Math.min(stats[9], game.samples[i].mobility);
			}

			let tds = this.htmlElement.find("tr").last().children();

			for (let i = 0; i < stats.length; i++){
				$(tds[i]).html(stats[i]);
			}
		}

		updateUnitElements(){
			for (var i = 0; i < this.units.length; i++){
				this.units[i].setHealth();
			}
		}
	}
}

classes.FighterWing = class FighterWing extends classes.Unit {
	constructor(parentid, id){
		super("FighterWing", 30, "PD", 3, 2, 2, 0, 15, 5, 1, parentid, id);
	}
}

classes.BomberWing = class BomberWing extends classes.Unit {
	constructor(parentid, id){
		super("BomberWing", 75, "PD", 4, 1, 2, 4, 15, 3, 1, parentid, id);
	}
}

classes.Corvette = class Corvette extends classes.Unit {
	constructor(parentid, id){
		super("Corvette", 35, "Soft", 4, 1, 2, 3, 15, 4, 2, parentid, id);
	}
}

classes.Frigate = class Frigate extends classes.Unit {
	constructor(parentid, id){
		super("Frigate", 50, "Soft", 6, 2, 2, 2, 15, 4, 2, parentid, id);
	}
}

classes.Destroyer = class Destroyer extends classes.Unit {
	constructor(parentid, id){
		super("Destroyer", 100, "Hard", 12, 3, 6, 4, 10, 3, 3, parentid, id);
	}
}

classes.Cruiser = class Cruiser extends classes.Unit {
	constructor(parentid, id){
		super("Cruiser", 200, "Hard", 30, 6, 8, 5, 5, 2, 3, parentid, id);
	}
}

classes.Battleship = class Battleship extends classes.Unit {
	constructor(parentid, id){
		super("Battleship", 500, "Hard", 54, 12, 12, 18, 0, 1, 4, parentid, id);
	}
}


const game = {
	samples: [new classes.FighterWing(), new classes.BomberWing(), new classes.Corvette(), new classes.Frigate(), new classes.Destroyer(), new classes.Cruiser(), new classes.Battleship()],
	grid: false,
	units: false,
	width: 0,
	height: 0,
	fieldSize: 0,
	fleets: [],
	idindex: 0,
	mode: 1,
	mouseTicker: 0,
	userid: 1,
	turn: 1,

	getUnit: function(id){
		for (let i = 0; i < this.fleets.length; i++){
			if (this.fleets[i].id == id){return this.fleets[i];}
		}
	},
	fieldIsEmpty: function(pos){
		for (let i = 0; i < this.fleets.length; i++){
			if (this.fleets[i].loc.x == pos.x && this.fleets[i].loc.y == pos.y){
				return false;
			}
		}
		return true;
	},
	hasEnemyUnitOnField(pos){
		for (let i = 0; i < this.fleets.length; i++){
			if (this.fleets[i].loc.x == pos.x && this.fleets[i].loc.y == pos.y){
				if (!this.fleets[i].friendly){
					return true;
				}
			}
		}
		return false;
	},
	getAllUnitsByCoords(pos){
		let units = [];
		for (let i = 0; i < this.fleets.length; i++){
			if (this.fleets[i].loc.x == pos.x && this.fleets[i].loc.y == pos.y){
				units.push(this.fleets[i]);
			}
		}
		return units;
	},
	getFleetId: function(){
		this.idindex++;
		return this.idindex;
	},
	updateCanvas: function(){
		this.units.clearRect(0, 0, this.width, this.height);

		this.drawAttacks();
		this.drawUnits();
	},
	drawAttacks: function(){
		for (let i = 0; i < this.fleets.length; i++){
			if (this.fleets[i].loc.x == 0 || this.fleets[i].loc.y == 0){continue;}
			if (this.fleets[i].attack.x == 0){continue;}

			let originX = this.fleets[i].loc.x * this.fieldSize - this.fieldSize/2;
			let originY = this.fleets[i].loc.y * this.fieldSize - this.fieldSize/2;
			let targetX = this.fleets[i].attack.x * this.fieldSize - this.fieldSize/2;
			let targetY = this.fleets[i].attack.y * this.fieldSize - this.fieldSize/2;

			this.units.strokeStyle = this.fleets[i].friendly ? "green" : "red";

			this.units.beginPath();
			this.units.moveTo(originX, originY)
			this.units.lineTo(targetX, targetY);
			this.units.closePath();
			this.units.stroke();
		}
	},
	drawUnits: function(){
		for (let i = 0; i < this.fleets.length; i++){
			if (this.fleets[i].loc.x == 0 || this.fleets[i].loc.y == 0){continue;}

			let x = this.fleets[i].loc.x * this.fieldSize - this.fieldSize/2;
			let y = this.fleets[i].loc.y * this.fieldSize - this.fieldSize/2;

			this.units.beginPath();
			this.units.fillStyle = this.fleets[i].friendly ? "green" : "red";
			this.units.arc(x, y, 8, 0, 2*Math.PI, false);
			this.units.closePath();
			this.units.fill();

			this.units.beginPath();
			this.units.fillStyle = "black";
			this.units.textStyle = ""
			this.units.fillText(this.fleets[i].id, x, y + 5);
			this.units.closePath();
			this.units.fill();

			this.units.fillStyle = "white";
		}
	},
	resolveAllCombats: function(){
		for (let i = 0; i < this.fleets.length; i++){
			if (this.fleets[i].loc.x == 0 || this.fleets[i].loc.y == 0){continue;}
			if (this.fleets[i].attack.x == 0){continue;}

			var shooter = this.fleets[i];
			var target = this.getAllUnitsByCoords(this.fleets[i].attack);

			this.resolveSingleCombat(shooter, target[Math.floor(Math.random()*target.length)]);
		}
	},

	resolveSingleCombat: function(shooter, target){
		//console.log(shooter);
		//console.log(target[Math.floor(Math.random()*target.length)]);

		shooter.fireAt(target);
		target.fireAt(shooter);

		this.endTurn();
	},

	endTurn: function(){
		this.turn++;
		this.updateAllFleetTables();
	},

	updateAllFleetTables: function(){
		for (let i = 0; i < this.fleets.length; i++){
			this.fleets[i].updateUnitElements();
		}
	},


	checkMouseHover: function(e){
		for (let i = 0; i < this.fleets.length; i++){
			if (this.fleets[i].loc.x != this.coords.x || this.fleets[i].loc.y != this.coords.y){
				this.fleets[i].fleetHoverDiv.addClass("hidden"); continue;
			}

			console.log("fleet " + this.fleets[i].id);
			if (this.fleets[i].fleetHoverDiv.is(":hidden")){
				this.fleets[i].fleetHoverDiv.removeClass("hidden").css("top", e.clientY + 50).css("left", e.clientX - 30);
			}
		}
	}
}

$(document).ready(function(){
	$(document.body).append($("<input>").attr("type", "button").attr("value", "new fleet").click(addNewFleet))
	$(document.body).append($("<input>").attr("type", "button").attr("value", "combat").click(resolveCombats))

	game.width = Math.round($("#game").width());
	game.height = Math.round($("#game").height());
	game.fieldSize = game.width/10 ;

	let canva = document.getElementsByTagName("Canvas");
	for (let i = 0; i < canva.length; i++){
		canva[i].width = game.width;
		canva[i].height = game.height;		
		canva[i].style.width = game.width;
		canva[i].style.height = game.height;
	}


	game.mouse = document.getElementById("mouse");

	game.grid = document.getElementById("grid").getContext("2d");
	game.grid.fillStyle = "white";
	game.grid.strokeStyle = "white";
	game.grid.font = "10px Arial";
	game.grid.textAlign = "center";

	game.units = document.getElementById("units").getContext("2d");
	game.units.fillStyle = "white";
	game.units.strokeStyle = "white";
	game.units.font = "12px Arial";
	game.units.textAlign = "center";


	for (let i = 0; i <= game.width; i+= game.fieldSize){
		game.grid.beginPath();
		game.grid.moveTo(0, i);
		game.grid.lineTo(game.width, i);
		game.grid.closePath();
		game.grid.stroke();
	}

	for (let i = 0; i <= game.height; i+= game.fieldSize){
		game.grid.beginPath();
		game.grid.moveTo(i, 0);
		game.grid.lineTo(i, game.height);
		game.grid.closePath();
		game.grid.stroke();
	}

	let fields = [];

	let maxRows = game.height / game.fieldSize;
	let maxCols = game.width / game.fieldSize;

	let row = 1;
	let col = 1;

	for (i = col; i <= maxCols; i++){
		fields.push({x: i, y: row});

		if (i == maxCols){
			if (row == maxRows){
				break;
			}

			i = 0;
			row++;
		}
	}

	for (let i = 0; i < fields.length; i++){
		game.grid.fillText(fields[i].x + "-" + fields[i].y, (fields[i].x-1) * game.fieldSize + game.fieldSize/2, (fields[i].y-1) * game.fieldSize + game.fieldSize*.9);
	}

	
	$(game.mouse).click(function(e){
		e.stopPropagation();
		let mousePos = $(this).position();
		let contPos = $(this).parent().position();
		//console.log((e.originalEvent.clientX - pos.left) + ("/") + (e.originalEvent.clientY - pos.top));

		let pos = {
			x: Math.ceil((e.originalEvent.clientX - mousePos.left - contPos.left) / game.fieldSize),
			y: Math.ceil((e.originalEvent.clientY - mousePos.top - contPos.top) / game.fieldSize)
		}

		if (game.activeFleet){
			if (game.fieldIsEmpty(pos)) {
				game.activeFleet.doPlace(pos);
			}
			else if (game.hasEnemyUnitOnField(pos)) {
				game.activeFleet.setAttack(pos);
			}
		}
		else {
			let unitsOnField = game.getAllUnitsByCoords(pos);
			let friendlies = [];
			for (let i = 0; i < unitsOnField.length; i++){
				if (unitsOnField[i].userid == game.userid){
					friendlies.push(unitsOnField[i]);
				}
			}
			if (friendlies.length){
				friendlies[0].doSelect();
			}
		}
	})

	$(game.mouse).mousemove(function(e){
		e.stopPropagation();
		game.mouseTicker++;
		if (game.mouseTicker < 2){return;}
		game.mouseTicker = 0;

		let pos = $(this).position()
		let contPos = $(this).parent().position()
		//console.log((e.originalEvent.clientX - pos.left) + ("/") + (e.originalEvent.clientY - pos.top));

		let x = Math.ceil((e.originalEvent.clientX - pos.left - contPos.left) / game.fieldSize);
		let y = Math.ceil((e.originalEvent.clientY - pos.top - contPos.top) / game.fieldSize);

		//console.log(x+"/"+y);
		game.coords = {x: x, y: y};

		game.checkMouseHover(e);
	})
})

function addNewFleet(){
	game.fleets.push(new classes.Fleet(game.getFleetId()));
}

function resolveCombats(){
	game.resolveAllCombats();
}

function addUnitToFleet(element){
	let name = $(element).children().eq(1).html();
	let fleetid = $(element).closest(".fleetDiv").data("fleetid");
	let fleet = game.getUnit(fleetid);
		fleet.addUnit(name)
}

function removeUnitFromFleet(element){
	let name = $(element).children().eq(1).html();
	let fleetid = $(element).closest(".fleetDiv").data("fleetid");
	let fleet = game.getUnit(fleetid);
		fleet.removeUnit(name)
}

function selectFleet(fleetid){
	console.log(fleetid);
	game.getUnit(fleetid).doSelect();
}
