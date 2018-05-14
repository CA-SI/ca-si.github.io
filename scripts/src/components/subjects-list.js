/**
 * Usage:
 * <div data-component="subjects-list">
 *   <h3 class="subjects-count" data-hook="subjects-count"></h3>
 *   <input type="text" data-hook="search-query" placeholder="Search..." class="form-control">
 *   <div data-hook="subjects-items"></div>
 * </div>
 *
 * Optionally, add filters to the component element such as
 *   data-period="sample-department"
 *   data-category="education"
 */
import {pick, defaults, filter} from 'lodash'

import TmplSubjectItem from '../templates/subject-item'
import {queryByHook, setContent, createSubjectFilters} from '../util'

export default class {
  constructor (opts) {
    const elements = {
      subjectsItems: queryByHook('subjects-items', opts.el),
      subjectsCount: queryByHook('subjects-count', opts.el),
      searchQuery: queryByHook('search-query', opts.el)
    }

    // Filter subjects and render in items container
    const paramFilters = pick(opts.params, ['period', 'category'])
    const attributeFilters = pick(opts.el.data(), ['period', 'category'])
    const filters = createSubjectFilters(defaults(paramFilters, attributeFilters))
    const filteredSubjects = filter(opts.subjects, filters)
    const subjectsMarkup = filteredSubjects.map(TmplSubjectItem)
    setContent(elements.subjectsItems, subjectsMarkup)

    // // Subject count
    const subjectSuffix =  filteredSubjects.length > 1 ? 's' : ''
    const subjectsCountMarkup = filteredSubjects.length + ' subject' + subjectSuffix;
    setContent(elements.subjectsCount, subjectsCountMarkup)

    // Search subjects listener
    const searchFunction = this._createSearchFunction(filteredSubjects)
    elements.searchQuery.on('keyup', (e) => {
      const query = e.currentTarget.value

      // Subjects
      const results = searchFunction(query)
      const resultsMarkup = results.map(TmplSubjectItem)
      setContent(elements.subjectsItems, resultsMarkup)

      // Subject count
      const resultsCountMarkup = results.length + ' subjects'
      setContent(elements.subjectsCount, resultsCountMarkup)
    })
  }

  // Returns a function that can be used to search an array of subjects
  // The function returns the filtered array of subjects
  _createSearchFunction (subjects) {
    const keys = ['title', 'notes']
    return function (query) {
      const lowerCaseQuery = query.toLowerCase()
      return filter(subjects, function (subject) {
        return keys.reduce(function (previousValue, key) {
          return previousValue || (subject[key] && subject[key].toLowerCase().indexOf(lowerCaseQuery) !== -1)
        }, false)
      })
    }
  }
}
