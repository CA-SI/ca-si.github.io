import $ from 'jquery'
import {chain, pick, omit, filter, defaults} from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import {setContent, slugify, createSubjectFilters, collapseListGroup} from '../util'

export default class {
  constructor (opts) {
    const periods = this._periodsWithCount(opts.subjects, opts.params)
    const periodsMarkup = periods.map(TmplListGroupItem)
    setContent(opts.el, periodsMarkup)
    collapseListGroup(opts.el)
  }

  _periodsWithCount (subjects, params) {
    return chain(subjects)
      .groupBy('period')
      .map(function (subjectsInOrg, period) {
        const filters = createSubjectFilters(pick(params, ['category']))
        const filteredSubjects = filter(subjectsInOrg, filters)
        const orgSlug = slugify(period)
        const selected = params.period && params.period === orgSlug
        const itemParams = selected ? omit(params, 'period') : defaults({period: orgSlug}, params)
        return {
          title: period,
          url: '?' + $.param(itemParams),
          count: filteredSubjects.length,
          unfilteredCount: subjectsInOrg.length,
          selected: selected
        }
      })
      .orderBy('unfilteredCount', 'desc')
      .value()
  }
}
