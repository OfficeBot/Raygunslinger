#pragma strict

class TileStack {
	var stack : Tile[];
}

class Chunk {
	var name : String;
	var tiles : TileStack[,];
	var index : int = 0;
	var position : Vector2;
	var container : GameObject = new GameObject();
}


var mapWidth : Number;
var mapHeight : Number;
var tileset : TileSet;
var mapData : TileStack[,]; //should be private
// var mapChunks = new Array();
var mapChunks : Chunk[,];
var chunkSize : int = 500;
var loadingObject : GameObject;
private var cam : GameObject;
private var chunkWidth = mapWidth / chunkSize;
private var chunkHeight = mapHeight / chunkSize;
//single dim array version
// function InitMapData() {
// 	var mapLength = mapHeight * mapWidth;
// 	mapData = new Tile[mapLength];
// 	for (var k = 0; k < mapLength; k++) {
// 		mapData[k] = new GamePoint();
// 		mapData[k].tiles = new Tile[];
// 	}
// }

//multiple dim array version
function InitMapData() {
	// var mapLength = mapHeight * mapWidth;
	mapChunks = new Chunk[mapWidth / chunkSize, mapHeight / chunkSize];
	chunkWidth = mapWidth / chunkSize;
	chunkHeight = mapHeight / chunkSize;
	var x : int;
	var y : int;

	for (x = 0; x < chunkWidth; x++) {
		for (y = 0; y < chunkHeight; y++) {
			mapChunks[x, y] = new Chunk();
			mapChunks[x, y].name = "Chunk_"+x+"_"+y;
			mapChunks[x, y].container.name = mapChunks[x, y].name;
			mapChunks[x, y].container.isStatic = true;
			mapChunks[x, y].tiles = new TileStack[chunkSize , chunkSize];
			mapChunks[x, y].position = new Vector2(x * chunkSize , y * (chunkSize / 2.0) );
		}
	}

	mapData = new TileStack[mapWidth, mapHeight];
	//this is a bad hack for mapping the two arrays together. There has to be a better way
	var xOffset : int = 0;
	var yOffset : int = 0;

	for (x = 0; x < mapWidth; x++) {
		for (y = 0; y < mapHeight; y++) {
			mapData[x,y] = new TileStack();
			mapData[x,y].stack = new Tile[5];
			mapData[x,y].stack[0] = tileset.dryGround[0];
			var chunkIndexX = x / chunkSize;
			var chunkIndexY = y / chunkSize;
			mapChunks[chunkIndexX, chunkIndexY].tiles[xOffset,yOffset] = mapData[x,y];
			yOffset++;
			if (yOffset == chunkSize) {
				yOffset = 0;
			}
		}
		xOffset++;
		if (xOffset == chunkSize) {
			xOffset = 0;
		}
	}
}


function CalculatePointsOfInterest() {
	var road = tileset.roads[0];
	// var distance = 0;
	//for now, pick two random spots on the map, fill them with dirt, and draw a line
	//between them
	var firstPoint : Vector3;
	var secondPoint : Vector3;
	firstPoint = Vector3(Random.Range(0,mapWidth) , Random.Range(0,mapHeight),0);
	secondPoint = Vector3(Random.Range(0,mapWidth) , Random.Range(0,mapHeight),0);

	mapData[firstPoint.x, firstPoint.y].stack[1] = road;
	mapData[secondPoint.x, secondPoint.y].stack[1] = road;

	firstPoint.y = firstPoint.y / 2.0;
	secondPoint.y = secondPoint.y / 2.0;



	//-----

	var startX : int;
	var endX : int;
	var startY : int;
	var endY : int;
	var yDir : int = 1;

	if (firstPoint.x < secondPoint.x) {
		startX = firstPoint.x;
		endX = secondPoint.x;
		startY = firstPoint.y;
		endY = secondPoint.y;
		if (startY < endY) {
			yDir = -1;
		}
	} else {
		startX = secondPoint.x;
		endX = firstPoint.x;
		startY = secondPoint.y;
		endY = firstPoint.y;
		if (startY < endY) {
			yDir = -1;
		}
	}

	startX = Mathf.Min(firstPoint.x, secondPoint.x);
	endX = Mathf.Max(firstPoint.x, secondPoint.x);

	startY = Mathf.Min(firstPoint.y, secondPoint.y) * 2;
	endY = Mathf.Max(firstPoint.y, secondPoint.y) * 2;

	var x : int;
	var y : int;
	var chunkX  : int;
	var chunkY : int;
	var offsetX : int;
	var offsetY : int;

	for (x = startX; x < endX; x++) {
		// mapData[x , startY ].stack[1] = road;
		chunkX = x / chunkSize;
		chunkY = startY / chunkSize;
		offsetX = x % chunkSize;
		offsetY = startY % chunkSize;
		mapChunks[chunkX, chunkY].tiles[offsetX, offsetY].stack[1] = road;

	}
	if (yDir == 1) {
		for (y = startY; y < endY; y++) {
			// mapData[startX , y].stack[1] = road;
			chunkX = startX / chunkSize;
			chunkY = y / chunkSize;
			offsetX = startX % chunkSize;
			offsetY = y % chunkSize;
			mapChunks[chunkX, chunkY].tiles[offsetX, offsetY].stack[1] = road;
		}
	} else {
		for (y = startY; y < endY; y++) {
			// mapData[endX , y].stack[1] = road;
			chunkX = endX / chunkSize;
			chunkY = y / chunkSize;
			offsetX = endX % chunkSize;
			offsetY = y % chunkSize;
			mapChunks[chunkX, chunkY].tiles[offsetX, offsetY].stack[1] = road;
		}
	}
}

// function Render() {
// 	var tileWidth = 1;
// 	var tileHeight = 1;
// 	for (var k = 0; k < mapWidth; k++) {
// 		for (var i = 0; i < mapHeight; i++) {
// 			Instantiate (mapData[k + i * mapWidth], Vector3(k * tileWidth, i * .5, 0), Quaternion.identity);
// 			if (i * k % chunkSize == 1) {
// 				yield;
// 			}
// 		}
// 	}
// }

function GoodRenderInChunks() {
	var tileWidth = 1.0;
	var tileHeight = 0.5;
	var widthChunkCount = mapWidth / chunkSize;
	var heightChunkCount = mapHeight / chunkSize;
	var xOffset = 0;
	var yOffset = 0;
	for (var cW = 0; cW < widthChunkCount; cW++) {
		for (var cH = 0; cH < heightChunkCount; cH++) {
			// var chunk = new GameObject();
			// chunk.active = false;
			// chunk.name = "Chunk_" + q + "x" + k;
			// chunk.transform.position.x = xOffset + (chunkSize / 2.0);
			// chunk.transform.position.y =  yOffset + (chunkSize / 4.0);
			// chunk.transform.localScale.x = chunkSize;
			// chunk.transform.localScale.y = chunkSize / 2.0;
			for (var x = 0; x < chunkSize; x++) {
				for (var y = 0; y < chunkSize; y++) {
					// var xOffset = x + cW;
					// var yOffset = y + cH;
					var chunkIndexX = xOffset / chunkSize;
					var chunkIndexY = yOffset / chunkSize;
					var chunk = mapChunks[chunkIndexX, chunkIndexY];
					for (var z = mapData[xOffset,yOffset].stack.length-1; z >= 0; z--) {
						if (mapData[xOffset,yOffset].stack[z] != null) {
							var tile = Instantiate( mapData[xOffset,yOffset].stack[z], Vector3(x * tileWidth + xOffset, y * tileHeight + yOffset, 0), Quaternion.identity );
							tile.transform.parent = chunk.container.transform;
						}
					}
				}
			}
			xOffset += chunkSize;
		}
		yOffset += chunkSize / 2;
		xOffset = 0;
	}
	
}

function RenderInChunks() {
	//make this global or something
	//these two variables simply reference the aspect ration of the sprites
	//that is, if the sprites are 32x16, then the ration is 1x0.5
	var tileWidth = 1.0;
	var tileHeight = 0.5;

	var chunkW = mapWidth / chunkSize;
	var chunkH = mapHeight / chunkSize;
	for (var cW = 0; cW < chunkW; cW++) {
		for (var cH = 0; cH < chunkH; cH++) {
			var currentChunk = mapChunks[cW,cH];
			var tiles = currentChunk.tiles;
			//tiles is a multi-dim array
			for (var x = 0; x < chunkSize; x++) {
				for (var y = 0; y < chunkSize; y++) {
					for (var z = 0; z < tiles[x,y].stack.length; z++) {
						if (tiles[x,y].stack[z] != null) {
							var tile = Instantiate( tiles[x,y].stack[z], Vector3(x * tileWidth, y * tileHeight, 0), Quaternion.identity );
							tile.transform.parent = currentChunk.container.transform;
						}
					}
				}
			}
			currentChunk.container.transform.position = currentChunk.position;

		}
	}
	
}

function _RenderInChunks() {
	var tileWidth = 1.0;
	var tileHeight = 0.5;
	for (var x = 0; x < mapWidth; x++) {
		for (var y = 0; y < mapHeight; y++) {
			for (var z = mapData[x,y].stack.length-1; z >= 0; z--) {
				if (mapData[x,y].stack[z] != null) {
					var tile = Instantiate( mapData[x,y].stack[z], Vector3(x * tileWidth, y * tileHeight, 0), Quaternion.identity );
				}
			}
		}
	}
}

// function RenderInChunks() {
// 	var tileWidth = 1;
// 	var tileHeight = 0.5;
// 	var widthChunkCount = mapWidth / chunkSize;
// 	var heightChunkCount = mapHeight / chunkSize;

// 	var xOffset = 0;
// 	var yOffset = 0;
// 	// var chunkCount = widthChunkCount * heightChunkCount;
// 	var xChunkLength = mapWidth / chunkSize;
// 	var yChunkLength = mapHeight / chunkSize;
// 	for (var k = 0; k < yChunkLength; k++) {
// 		for (var q = 0; q < xChunkLength; q++) {
// 			//get tiles for this chunk from mapData
// 			//this makes one chunk
// 			var chunkColor = Color(Random.value , Random.value, Random.value);
// 			var chunk = new GameObject();
// 			chunk.active = false;
// 			chunk.name = "Chunk_" + q + "x" + k;
// 			chunk.transform.position.x = xOffset + (chunkSize / 2.0);
// 			chunk.transform.position.y =  yOffset + (chunkSize / 4.0);
// 			chunk.transform.localScale.x = chunkSize;
// 			chunk.transform.localScale.y = chunkSize / 2.0;
// 			// var box = chunk.AddComponent(BoxCollider);
// 			// box.size.x = chunkSize;
// 			// box.size.y = chunkSize / 2.0;
// 			// box.center.x = chunkSize / 2.0;
// 			// box.center.y = chunkSize / 4.0;
// 			mapChunks.push(chunk);
// 			for (var x = 0; x < chunkSize; x++) {
// 				for (var y = 0; y < chunkSize; y++) {
// 					for (var z = 0; z < mapData[x , y].stack.length; z++) {
// 						if (mapData[q*x , k*y].stack[z] != null) {
// 							var tile = Instantiate (mapData[q*x , k*y].stack[z], Vector3(x * tileWidth + xOffset , y * tileHeight + yOffset, 0), Quaternion.identity);
// 							tile.transform.parent = chunk.transform;
// 						}
// 					}
// 					// var tile = Instantiate (mapData[x + y * mapWidth][0], Vector3(x * tileWidth + xOffset , y * tileHeight + yOffset, 0), Quaternion.identity);
// 					// tile.transform.parent = chunk.transform;
// 				}
// 			}
// 			xOffset += chunkSize;
// 			//base rendering on last tile placed
// 		}

// 		yOffset += chunkSize / 2;
// 		xOffset = 0;
// 		// yield;
// 		//don't yield. Wait to load the entire level
// 	}
// }


// function ShowChunks() {
// 	for (var k = 0; k < mapChunks.length; k++) {
// 		var chunk : GameObject = mapChunks[k];
// 		chunk.active = true;
// 		// yield;
// 	}
// }


function ShowChunks() {
	while (true) {
		var x : int;
		var y : int;
		var l : int = mapChunks.length;
		// var camNormal = Vector3(cam.transform.position.x, cam.transform.position.y, 0);
		var camNormal = cam.transform.position;
		for (x = 0; x < chunkWidth; x++) {
			for (y = 0; y < chunkHeight; y++) {
				var chunk : GameObject = mapChunks[x,y].container;
				var dist = Vector3.Distance(camNormal, chunk.transform.position);
				// Debug.DrawLine(camNormal, chunk.transform.position, Color.red);
				// var dist = (camNormal - chunk.transform.position).magnitude;
				// Debug.Log(chunk.name + ' : ' + dist);
				if (dist <= 40) {
					chunk.active = true;
				} else {
					chunk.active = false;
				}
			}
		}
		yield WaitForSeconds(0.5);
	}
}

function Start () {
	cam = GameObject.FindWithTag("MainCamera");
	//center the camera on the board
	cam.transform.position.x = mapWidth / 2;
	cam.transform.position.y = mapHeight / 4;
	InitMapData();
	// for (var k =0; k < 4; k++) {
	// 	CalculatePointsOfInterest();
	// }

	// Render();
	yield;
	RenderInChunks();
	loadingObject.SetActive(false);
	ShowChunks();	
}

function Update() {
	// var camNormal = cam.transform.position;
	// var chunkCountX = mapWidth / chunkSize;
	// var chunkCountY = mapHeight / chunkSize;
	// for (var x = 0; x < chunkCountX; x++) {
	// 	for (var y = 0; y < chunkCountY; y++) {
	// 		var pos = new Vector3(0,0,0);
	// 		pos.x = mapChunks[x,y].position.x;
	// 		pos.y = mapChunks[x,y].position.y;
	// 		Debug.DrawLine(camNormal, pos, Color.red);
	// 	}
	// }
	
	// var k : int;
	// var l : int = mapChunks.length;
	// var camNormal = Vector3(cam.transform.position.x, cam.transform.position.y, 0);

	// for (k = 0; k < l; k++) {
	// 	var chunk : GameObject = mapChunks[k];
	// 	var dist = (camNormal - chunk.transform.position).magnitude;
	// 	if (dist < 50) {
	// 		chunk.active = true;
	// 	} else {
	// 		chunk.active = false;
	// 	}
	// }
}
