"use strict"
/**
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} data 
 */
const drawLine = (canvas, ctx, data) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    data.forEach((val, idx) => {
        ctx.lineTo(
            canvas.width * (idx / data.length),
            (canvas.height / 2) * (1 - val));
    })
    ctx.stroke();
}

/**
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} data 
 */
const drawBar = (canvas, ctx, data) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    data.forEach((val, idx) => {
        ctx.fillRect(
            canvas.width * (idx / data.length),
            canvas.height / 2,
            Math.ceil(canvas.width / data.length),
            - ((canvas.height / 2) * val)
        )
    })
}

/**
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} at 
 */
const addVerticalLine = (canvas, ctx, at) => {
    ctx.beginPath()
    ctx.lineTo(
        canvas.width * at,
        0)
    ctx.lineTo(
        canvas.width * at,
        canvas.height)
    ctx.stroke()
}