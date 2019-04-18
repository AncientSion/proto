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

			this.damages = [];
			this.element;

			this.createSingleHTMLElement();
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

			for (let i = 0; i < this.hp; i++){
				healthCon.append($("<div>").addClass("health"));
			}

			this.element.append(healthCon);

		}
	},

	Fleet: class Fleet {
		constructor(id){
			this.id = id;
			this.samples = [];
			this.units = [];
			this.pos;
			this.htmlElement;
			this.idindex = 0;
			this.x = 0;
			this.y = 0;

			this.createElement();
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
				game.activeFleet = 0;
				this.htmlElement.find(".btn").html("select").removeClass("activeFleet");
			}
		}

		doPlace(x, y){
			this.x = x;
			this.y = y;
			this.doSelect();
			game.updateCanvas();
		}

		getUnitId(){
			this.idindex++;
			return this.idindex;
		}

		createElement(){

			var buttonHtml = (this.x != 0 && this.y != 0 ? "select" : "confirm")

			let classTable = $("<table>")
			let thead = $("<thead>")
			.append($("<tr>")
				.append($("<td>").attr("colSpan", 9).html("Fleet #" + this.id))
				.append($("<td>").attr("colSpan", 2)
					.append($("<div>")
						.addClass("btn")
						.html(buttonHtml)
						.click(function(){
							selectFleet($(this).closest(".fleetDiv").data("fleetid"))
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
				stats[9] =  Math.min(stats[9], game.samples[i].mobility)

			}

			let tds = this.htmlElement.find("tr").last().children();

			for (let i = 0; i < stats.length; i++){
				$(tds[i]).html(stats[i]);
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
	getUnit: function(id){
		for (let i = 0; i < this.fleets.length; i++){
			if (this.fleets[i].id == id){return this.fleets[i];}
		}
	},
	getFleetId: function(){
		this.idindex++;
		return this.idindex;
	},
	updateCanvas: function(){
		this.units.clearRect(0, 0, this.width, this.height);

		for (let i = 0; i < this.fleets.length; i++){
			if (this.fleets[i].x == 0 || this.fleets[i].y == 0){continue;}

			this.units.beginPath();
			this.units.arc(this.fleets[i].x * this.fieldSize - this.fieldSize/2, this.fleets[i].y * this.fieldSize - this.fieldSize/2, 6, 0, 2*Math.PI, false);
			this.units.closePath();
			this.units.fill();
		}
	}
}

$(document).ready(function(){
	$(document.body).append($("<input>").attr("type", "button").attr("value", "new fleet").click(addNewFleet))

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
	game.units = document.getElementById("units").getContext("2d");
	game.units.fillStyle = "yellow";
	game.grid = document.getElementById("grid").getContext("2d");

/*	game.plane.beginPath();
	game.plane.arc(game.width/2, game.height/2, 5, 0, 2*Math.PI, 0);
	game.plane.closePath();
	game.plane.fillStyle = "yellow";
	game.plane.fill();
*/
	game.grid.strokeStyle = "white";

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

	game.grid.fillStyle = "yellow";
/*	for (let i = 0; i <= game.width; i+= game.fieldSize){
		game.plane.beginPath();
		game.plane.fillText(i, i + game.fieldSize/3, game.height - game.fieldSize/3);
		game.plane.closePath();
	}
*/	

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


	game.grid.textAlign = "center";
	for (let i = 0; i < fields.length; i++){
		game.grid.fillText(fields[i].x + "-" + fields[i].y, (fields[i].x-1) * game.fieldSize + game.fieldSize/2, (fields[i].y-1) * game.fieldSize + game.fieldSize*.9);
	}

	
	$(game.mouse).click(function(e){
		e.stopPropagation();
		let pos = $(this).position()
		let contPos = $(this).parent().position()
		//console.log((e.originalEvent.clientX - pos.left) + ("/") + (e.originalEvent.clientY - pos.top));

		let x = Math.ceil((e.originalEvent.clientX - pos.left - contPos.left) / game.fieldSize);
		let y = Math.ceil((e.originalEvent.clientY - pos.top - contPos.top) / game.fieldSize);

		console.log(x+"/"+y);


		if (!game.activeFleet){return;}

		game.activeFleet.doPlace(x, y);
	})

	$(game.mouse).mousemove(function(e){
		return;

		e.stopPropagation();
		let pos = $(this).position()
		let contPos = $(this).parent().position()
		//console.log((e.originalEvent.clientX - pos.left) + ("/") + (e.originalEvent.clientY - pos.top));

		let x = Math.ceil((e.originalEvent.clientX - pos.left - contPos.left) / game.fieldSize);
		let y = Math.ceil((e.originalEvent.clientY - pos.top - contPos.top) / game.fieldSize);

		console.log(x+"/"+y);
	})
})

function addNewFleet(){
	game.fleets.push(new classes.Fleet(game.getFleetId()));
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
