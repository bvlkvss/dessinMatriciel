const WIDTH = 100;
const HEIGHT = 100;

const canvas = document.createElement('canvas') as HTMLCanvasElement;
canvas.width = WIDTH;
canvas.height = HEIGHT;

const drawCanvas = document.createElement('canvas') as HTMLCanvasElement;
drawCanvas.width = WIDTH;
drawCanvas.height = HEIGHT;

const selectionCanvas = document.createElement('canvas');
selectionCanvas.width = WIDTH;
selectionCanvas.height = HEIGHT;

const canvasTestHelper = { canvas, drawCanvas, selectionCanvas };

export { canvasTestHelper };
