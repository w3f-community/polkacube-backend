'use strict';
const Service = require('egg').Service;
const { formatBalance } = require('@polkadot/util');
formatBalance.setDefaults({
  decimals: 12,
  unit: 'KSM',
});

class SlashService extends Service {

  async find(page, size, accountAddr) {
    size = size || 100;
    page = page || 1;
    size = size > 200 ? 200 : size;
    const offset = (page * size) - size;
    let slash = [];
    if (isNaN(offset)) {
      return slash;
    }
    if (accountAddr === null || accountAddr === '') {
      return slash;
    }
    if (accountAddr) {
      slash = await this.app.mysql.select('ksm_evt_slash', {
        where: { accountAddr },
        orders: [
          [ 'height', 'desc' ],
          [ 'index', 'desc' ],
        ],
        limit: +size,
        offset,
      });
    } else {
      slash = await this.app.mysql.select('ksm_evt_slash', {
        orders: [
          [ 'height', 'desc' ],
          [ 'index', 'desc' ],
        ],
        limit: +size,
        offset,
      });
    }
    slash = slash.map(obj => {
      obj.amount = formatBalance(obj.amount);
      return obj;
    });

    return slash;
  }

  async slashCountPageQuery(page, size, accountAddr) {
    size = size || 100;
    page = page || 1;
    size = size > 200 ? 200 : size;
    const offset = (page * size) - size;
    let slash = [];
    if (isNaN(offset)) {
      return slash;
    }
    if (accountAddr === null || accountAddr === '') {
      return slash;
    }
    if (accountAddr) {
      const sql = 'select sum(amount) amount,count(accountAddr) num,accountAddr,nickname from ksm_evt_slash where accountAddr=? GROUP BY accountAddr,nickname ORDER BY num DESC ';
      slash = await this.app.mysql.query(sql, [ accountAddr ]);
    } else {
      const sql = 'select sum(amount) amount,count(accountAddr) num,accountAddr,nickname from ksm_evt_slash  GROUP BY accountAddr,nickname ORDER BY num DESC limit ?,?';
      slash = await this.app.mysql.query(sql, [ offset, +size ]);
    }
    slash = slash.map(obj => {
      obj.amount = formatBalance(obj.amount);
      return obj;
    });

    return slash;
  }

}
module.exports = SlashService;
