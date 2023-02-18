const axios = require("axios");
const Logos = require("../models/AccessLogo");

exports.getLogoData = async (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;
  const start = req.query.start ? req.query.start : 0;
  let rlt;
  let length;
  if (
    from.length < 8 ||
    to.length < 8 ||
    from == "" ||
    from == undefined ||
    from == null ||
    from == "null" ||
    from == "null" ||
    to == "" ||
    to == undefined ||
    to == null ||
    to == "null" ||
    to == "null"
  ) {
    rlt = await Logos.find({})
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip(start * limit);
    length = await Logos.find({}).count();
  } else {
    const _toDate = new Date(to);
    _toDate.setDate(_toDate.getDate() + 1);
    const _fromDate = new Date(from);
    const query = {
      $and: [{ date: { $lte: _toDate } }, { date: { $gte: _fromDate } }],
    };
    rlt = await Logos.find(query)
      .limit(limit * 1)
      .skip(start * limit);
    length = await Logos.find(query).count();
  }
  res.send({ data: rlt, length: length });
};

exports.insertLogoData = async (req, res) => {
  const _insertData = new Logos({
    ipaddress: req.query.ipaddress,
    device: req.query.device,
    browsertype: req.query.browsertype,
  });
  const rlt = await _insertData.save();
  res.send(rlt);
};
