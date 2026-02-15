const pause_ms = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(`${ms}ms Passed!`);
        }, ms);
    });
}

let pause = {value: false}

export  {pause_ms, pause};