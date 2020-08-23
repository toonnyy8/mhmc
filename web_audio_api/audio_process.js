/**
 * 
 * @param {number} frameSize 
 * @returns {Array<number>}
 */
const hammingWindow = (frameSize, alpha = 0.53836) => {
    return new Array(frameSize)
        .fill(0)
        .map((_, idx) => {
            return alpha - (1 - alpha) * Math.cos((2 * Math.PI * idx) / (frameSize - 1))
        })
}

/**
 * 
 * @param {Array<number>} input 
 * @param {Array<number>} kernel 
 * @returns {Array<number>}
 */
const conv = (input, kernel) => {
    // console.log(input)
    // console.log(kernel)
    let _kernel = kernel.reverse()
    return new Array(input.length - kernel.length + 1)
        .fill(0)
        .map((_, shift) => {
            // console.log(shift)
            return kernel.reduce((prev, curr, idx) => {
                return prev + input[shift + idx] * curr
            }, 0)
        })
}

/**
 * 
 * @param {Array<number>} input
 * @returns {Array<number>}
 */
const autoCorrelation = (input) => {
    let _input = input.concat(new Array(input.length - 1).fill(0))
    let kernel = input.reverse()
    return conv(_input, kernel)//.map(val => val / input.length)
}


/**
 * 
 * @param {Array<number>} input
 * @param {number} scale
 * @returns {Array<number>}
 */
const resize = (input, scale) => {
    let output = new Array(Math.ceil(input.length / scale)).fill(0)
    output = output.map((_, idx) => {
        let arr = input.slice(idx * scale, (idx + 1) * scale)
        return arr.reduce((prev, curr) => prev + curr, 0) / arr.length
    })
    return output
}

/**
 *
 * @param {Array<number>} input
 * @param {Array<number>} window
 * @param {number} strides
 * @returns {Array<number>}
 */
const useWindow = (input, window, strides) => {
    let output = new Array(Math.ceil(input.length / strides)).fill(0)
    output = output.map((_, idx) => {
        return input
            .slice(idx * strides, idx * strides + window.length)
            .reduce(
                (prev, curr, idx) =>
                    prev + curr * window[idx], 0)
    })
    return output
}

/**
 *
 * @param {Array<number>} input
 * @param {number} window_size
 * @param {number} strides
 * @returns {Array<number>}
 */
const zeroCrossingRate = (input, window_size, strides) => {
    let output = new Array(Math.ceil(input.length / strides)).fill(0)
    output = output.map((_, idx) => {
        return input
            .slice(idx * strides, idx * strides + window_size)
            .reduce(
                (prev, curr, idx) => {
                    if (prev.value == 0 || curr == 0) {
                        if (prev.value == curr) {
                            return prev
                        } else {
                            return {
                                count: prev.count + 1,
                                value: curr
                            }
                        }
                    } else if (prev.value * curr < 0) {
                        return {
                            count: prev.count + 1,
                            value: curr
                        }
                    } else {
                        return {
                            count: prev.count,
                            value: curr
                        }
                    }
                }, { count: 0, value: 0 }).count
    })
    return output
}

/**
 *
 * @param {Array<number>} input
 * @param {number} sampleRate
 * @param {number} chackN
 * @returns {number}
 */
const pitch = (input, sampleRate, chackN) => {
    let pitch_data = input.reduce((prev, curr, idx) => {
        if (prev.chackN > 0) {
            if (prev.isRise) {
                if (curr - prev.value < 0) {
                    return {
                        isRise: false,
                        value: curr,
                        count: prev.count + 1,
                        chackN: prev.chackN - 1,
                        idx: idx,
                    }
                }
            }
            return {
                isRise: curr - prev.value > 0,
                value: curr,
                count: prev.count,
                chackN: prev.chackN,
                idx: idx,
            }
        }
        return prev
    }, { isRise: false, value: 0, count: 0, chackN: chackN, idx: 0 })

    if (pitch_data.count - 1 == 0) {
        return 0
    } else {
        return sampleRate / (pitch_data.idx / (pitch_data.count - 1))
    }

}