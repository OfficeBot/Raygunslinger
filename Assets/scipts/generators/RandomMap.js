#pragma strict
var width : Number;
var height : Number;
var scale : Number = 5;
private var mapData : Number[,];
private var tilePalette : TilePalette;
private var tileWidth : Number = 64;
private var tileHeight : Number = 64;
private var chunkSize = 100;

function Init() {
	var exteriorTileCount = tilePalette.exteriorTiles.length;
	var currentBlock = 0;
	for (var k = 0.0; k < width; k++) {
		for (var i = 0.0; i < height; i++) {
			currentBlock++;
			var xSeed = k / scale;
			var ySeed = i / scale;
			// Debug.Log("Seeds:" + xSeed + ', ' + ySeed);
			var noise = Mathf.PerlinNoise(xSeed, ySeed) * exteriorTileCount;
			noise = Mathf.Floor(noise);
			Debug.Log(noise);
			// mapData[k,i] = noise;
			//todo - move this into render loop
			var currentTile = tilePalette.exteriorTiles[noise];
			Instantiate (currentTile, Vector3(k + tileWidth, i + tileHeight, 0), Quaternion.identity);
			if (currentBlock == chunkSize) {
				currentBlock = 0;
				yield;
			}
		}
	}
}

function LoadPalette() {
	tilePalette = gameObject.GetComponent(TilePalette);
}

function Start () {
	LoadPalette();
	Init();
}

function Update () {

}