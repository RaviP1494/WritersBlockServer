const express = require("express");
const db = require("./db.js");
const Stream = require("./models/Stream");

const app = express();

app.use(express.json());

const router = new express.Router();

router.get("/:uid/streams", async function(req, res, next){
    const uid = req.params.uid;
    const userExistenceResp = await db.query(`
        SELECT username FROM users
        WHERE id = $1;`,
        [uid]
    );
    if (userExistenceResp.rows.length === 0){
        console.log("invalid uid on stream save");
        return res.json({error: "invalid uid on stream retrieval", stream: stream, uid: uid});
    }
    const streamsResp = await db.query(`
        SELECT id, title, saved_at, prevStreamId, originStreamId FROM streams
        WHERE user_id = $1
        ORDER BY saved_at DESC;
        `,
        [uid]
    );
    if (streamsResp.rows.length > 0){
        const spurtCountsReqs = streamsResp.rows.map(
            (stream) => {
                return db.query(`
                    SELECT COUNT(*) 
                    FROM spurts
                    WHERE stream_id = $1;
                    `,
                    [stream.id],
                );
            }
        );
        Promise.all(spurtCountsReqs)
        .then(spurtCountsResp => {
            return res.json({
                streams: streamsResp.rows.map(
                    (stream, i) => {
                        return {
                            ...stream,
                            saved_at: stream.saved_at.toLocaleString(),
                            spurtCount: spurtCountsResp[i].rows[0].count
                        };
                    }
                ) 
            });
        })
        .catch(error => {
            spurtCounts = error;
            return res.json({error: error});
        });
    }
});

router.get("/:uid/streams/:id", async function(req, res, next){
    const uid = req.params.uid;
    const id = req.params.id;
    const streamResp = await db.query(`
        SELECT id, title
        FROM streams
        WHERE id = $1
        `,
        [id]
    );
    const spurtsResp = await db.query(`
        SELECT id, color, last_edited, text_content
        FROM spurts
        WHERE stream_id = $1
        ORDER BY order_index;
        `,
        [id]
    );
    let stream = { ...streamResp.rows[0], spurts: spurtsResp.rows };
    return res.json(stream);
});

router.post("/:uid/streams/save/", async function(req, res, next){
    const uid = req.params.uid;
    const { stream } = req.body;
    const resp = await Stream.saveStream(uid, stream);
    return res.json(resp);
    });

app.use(router);

module.exports = app;
