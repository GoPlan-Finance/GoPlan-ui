/**
 *
 *
 *
 */

import { Holding, HoldingTimeSeries } from '/@common/models'
import { Query } from '/@common/Query'


Parse.Cloud.afterDelete(Holding, async (request) => {

  const holding : Holding = request.object

  const q = Query.create(HoldingTimeSeries)
  q.equalTo('holding', holding)
  q.limit(9999999)

  for (const ts of await q.find(HoldingTimeSeries.useMasterKey(true))) {
    await ts.destroy(HoldingTimeSeries.useMasterKey(true))
  }

})

