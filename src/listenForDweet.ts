import https from "https";

export default function listenForDweet(thing: string, callback: (x: any) => any) {
    const retval = {
        thing: thing,
        callback: callback,
        req: https.get("https://dweet.io/listen/for/dweets/from/" + thing, (res) => {
            res.on("data", (data) => {
                callback(JSON.parse(JSON.parse(data.subarray(data.indexOf(0x0a) + 1, data.length - 2).toString("utf8"))));
            });
        }),
        aborted: false,
        abort: () => {
            if (retval.aborted) {
                return;
            }
            retval.aborted = true;
            retval.req.socket?.destroy();
            retval.req.destroy();
        }
    };

    retval.req.on("error", () => {
        if (!retval.aborted) {
            setTimeout(
                () => {
                    if (!retval.aborted) {
                        listenForDweet(retval.thing, retval.callback);
                    }
                },
                listenForDweet.retryTimeout,
            );
        }
    });

    return retval;
}
listenForDweet.retryTimeout = 1500;
