///<reference path="./audio_process.js">
///<reference path="./draw.js">
"use strict"

document.getElementById("getUserMedia").onclick = () => {
    document.getElementById("getUserMedia").hidden = true
    document.getElementById("viewport").hidden = false
    navigator
        .mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then(stream => {
            /**
             * @type {HTMLCanvasElement}
             */
            const wave_canvas = document.getElementById("wave")
            const wave_ctx = wave_canvas.getContext("2d")
            wave_ctx.clearRect(0, 0, wave_canvas.width, wave_canvas.height)
            wave_ctx.fillStyle = "#ff2e88"
            wave_ctx.strokeStyle = "#ff2e88"

            /**
             * @type {HTMLCanvasElement}
             */
            const energy_canvas = document.getElementById("energy")
            const energy_ctx = energy_canvas.getContext("2d")
            energy_ctx.clearRect(0, 0, energy_canvas.width, energy_canvas.height)
            energy_ctx.fillStyle = "#ff2e88"
            energy_ctx.strokeStyle = "#ff2e88"

            /**
             * @type {HTMLCanvasElement}
             */
            const zcr_canvas = document.getElementById("zero-crossing-rate")
            const zcr_ctx = zcr_canvas.getContext("2d")
            zcr_ctx.clearRect(0, 0, zcr_canvas.width, zcr_canvas.height)
            zcr_ctx.fillStyle = "#ff2e88"
            zcr_ctx.strokeStyle = "#ff2e88"

            /**
             * @type {HTMLCanvasElement}
             */
            const ac_canvas = document.getElementById("auto-correlation")
            const ac_ctx = ac_canvas.getContext("2d")
            ac_ctx.clearRect(0, 0, ac_canvas.width, ac_canvas.height)
            ac_ctx.fillStyle = "#ff2e88"
            ac_ctx.strokeStyle = "#ff2e88"

            document.getElementById("ac-frame")
            /**
             * @type {HTMLInputElement }
             */
            const ac_frame = document.getElementById("ac-frame")
            ac_frame.onchange = () => {
                if (Number(ac_frame.value) > Number(ac_frame.max)) {
                    ac_frame.value = ac_frame.max
                }
            }

            /**
             * @type {HTMLCanvasElement}
             */
            const pitch_canvas = document.getElementById("pitch")
            const pitch_ctx = pitch_canvas.getContext("2d")
            pitch_ctx.clearRect(0, 0, pitch_canvas.width, pitch_canvas.height)
            pitch_ctx.fillStyle = "#ff2e88"
            pitch_ctx.strokeStyle = "#ff2e88"

            const sampleRate = stream
                .getAudioTracks()[0]
                .getSettings()
                .sampleRate
            const audioCtx = new window.AudioContext()
            const source = audioCtx.createMediaStreamSource(stream)
            const processor = audioCtx.createScriptProcessor(undefined, 1, 1)

            /**
             * @type {Array<number>}
             */
            let data = []
            processor.onaudioprocess = (e) => {
                let inpbuf = e.inputBuffer.getChannelData(0)
                drawBar(wave_canvas, wave_ctx, inpbuf)
                data = data.concat(...inpbuf)
            }

            const gainNode = audioCtx.createGain();

            source.connect(processor)
            processor.connect(gainNode)

            let hw = hammingWindow(sampleRate * 0.032)

            const start = () => {
                document.getElementById("start").hidden = true
                document.getElementById("stop").hidden = false
                ac_frame.max = 0
                data = []
                gainNode.connect(audioCtx.destination)
            }
            const stop = () => {
                document.getElementById("start").hidden = false
                document.getElementById("stop").hidden = true

                ac_frame.max = Math.ceil(data.length / (sampleRate * 0.016)) - 1
                ac_frame.value = 0

                gainNode.disconnect()

                let energy = useWindow(
                    // data.map(val => Math.abs(val)),
                    data.map(val => val ** 2),
                    hw,
                    sampleRate * 0.016)
                drawBar(wave_canvas, wave_ctx, data)
                drawLine(
                    energy_canvas,
                    energy_ctx,
                    (() => {
                        let max = energy.reduce((prev, curr) => prev >= curr ? prev : curr, 0)
                        document.getElementById("energy-max").innerText = Math.round(max * 100) / 100
                        return energy.map(val => val / max)
                    })(),
                    1
                )

                let zcr = zeroCrossingRate(
                    data,
                    sampleRate * 0.032,
                    sampleRate * 0.016)
                drawLine(
                    zcr_canvas,
                    zcr_ctx,
                    (() => {
                        let max = zcr.reduce((prev, curr) => prev >= Math.abs(curr) ? prev : Math.abs(curr), 0)
                        document.getElementById("zero-crossing-rate-max").innerText = Math.round(max * 100) / 100
                        return zcr.map(val => val / max)
                    })(),
                    1
                )

                let ac_data = new Array(Number(ac_frame.max) + 1)
                    .fill(0)
                    .map((_, frame) => autoCorrelation(
                        data.slice(
                            frame * sampleRate * 0.016,
                            frame * sampleRate * 0.016 + sampleRate * 0.032,
                        ).map((val, idx) => val * hw[idx])
                    ))

                ac_frame.onchange = () => {
                    if (Number(ac_frame.value) > Number(ac_frame.max)) {
                        console.log(ac_frame.value)
                        ac_frame.value = Number(ac_frame.max)
                    }

                    drawLine(
                        ac_canvas,
                        ac_ctx,
                        (() => {
                            let ac = ac_data[Number(ac_frame.value)]
                            let max = ac.reduce((prev, curr) => prev >= Math.abs(curr) ? prev : Math.abs(curr), 0)
                            return ac.map(val => val / max)
                        })()
                    )
                }
                ac_frame.onchange()

                drawLine(
                    pitch_canvas,
                    pitch_ctx,
                    (() => {
                        let p = ac_data.map(val => pitch(val, sampleRate, 5))
                        let max = p.reduce((prev, curr) => prev >= Math.abs(curr) ? prev : Math.abs(curr), 0)
                        document.getElementById("pitch-max").innerText = Math.round(max * 100) / 100
                        return p.map(val => val / max)
                    })(),
                    1
                )

                // console.log(energy, zcr)
                let { begin, end } = endPointDetection(energy, zcr, 30, Number(document.getElementById("IF").value))
                console.log(begin, end)
                wave_ctx.strokeStyle = "#2e88ff"
                addVerticalLine(wave_canvas, wave_ctx, begin / energy.length)
                addVerticalLine(wave_canvas, wave_ctx, end / energy.length)
                wave_ctx.strokeStyle = "#ff2e88"


                energy_ctx.strokeStyle = "#2e88ff"
                addVerticalLine(energy_canvas, energy_ctx, begin / energy.length)
                addVerticalLine(energy_canvas, energy_ctx, end / energy.length)
                energy_ctx.strokeStyle = "#ff2e88"

                zcr_ctx.strokeStyle = "#2e88ff"
                addVerticalLine(zcr_canvas, zcr_ctx, begin / energy.length)
                addVerticalLine(zcr_canvas, zcr_ctx, end / energy.length)
                zcr_ctx.strokeStyle = "#ff2e88"

                pitch_ctx.strokeStyle = "#2e88ff"
                addVerticalLine(pitch_canvas, pitch_ctx, begin / energy.length)
                addVerticalLine(pitch_canvas, pitch_ctx, end / energy.length)
                pitch_ctx.strokeStyle = "#ff2e88"
            }

            document.getElementById("start").onclick = start
            document.getElementById("stop").onclick = stop

        })
        .catch(err => {
            console.log(err)
        })
}