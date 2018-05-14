import $ from 'jquery'
import {chain, pick, omit, filter, defaults} from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import {setContent, slugify, createSubjectFilters, collapseListGroup} from '../util'

export default class {
  constructor (opts) {
    const categories = this._categoriesWithCount(opts.subjects, opts.params)
    const categoriesMarkup = categories.map(TmplListGroupItem)
    setContent(opts.el, categoriesMarkup)
    collapseListGroup(opts.el)
  }

  // Given an array of subjects, returns an array of their categories with counts
  _categoriesWithCount (subjects, params) {
    return chain(subjects)
      .filter('category')
      .flatMap(function (value, index, collection) {
        // Explode objects where category is an array into one object per category
        if (typeof value.category === 'string') return value
        const duplicates = []
        value.category.forEach(function (category) {
          duplicates.push(defaults({category: category}, value))
        })
        return duplicates
      })
      .groupBy('category')
      .map(function (subjectsInCat, category) {
        const filters = createSubjectFilters(pick(params, ['period']))
        const filteredSubjects = filter(subjectsInCat, filters)
        const categorySlug = slugify(category)
        const selected = params.category && params.category === categorySlug
        const itemParams = selected ? omit(params, 'category') : defaults({category: categorySlug}, params)
        return {
          title: category,
          url: '?' + $.param(itemParams),
          count: filteredSubjects.length,
          unfilteredCount: subjectsInCat.length,
          selected: selected
        }
      })
      .orderBy('unfilteredCount', 'desc')
      .value()
  }
}
