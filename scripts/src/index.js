/* global settings */
import $ from 'jquery'
import 'jquery-deparam'
import 'bootstrap/js/tab'
import {omit} from 'lodash'

import UserModel from './models/user'
import Navigation from './components/navigation'
import SubjectsList from './components/subjects-list'
import CategoriesFilter from './components/categories-filter'
import PeriodsFilter from './components/periods-filter'
import Form from './components/form'
import SubjectForm from './components/subject-form'
import AdminForm from './components/admin-form'
import CategoriesForm from './components/categories-form'
import LicensesForm from './components/licenses-form'
import SubjectDisplay from './components/subject-display'
import DeletePageButton from './components/delete-page-button'
import EditableList from './components/editable-list'
import ViewSwitcher from './components/view-switcher'
import ThemeGallery from './components/theme-gallery'
import {queryByComponent, setParams} from './util'

const params = $.deparam(window.location.search.substr(1))

// Initialize user
const user = new UserModel({
  clientId: params.clientId || settings.GITHUB_CLIENT_ID,
  proxyHost: params.proxyHost || settings.GATEKEEPER_HOST,
  repoOwner: settings.REPO_OWNER,
  repoName: settings.REPO_NAME
})

// If user is mid-login, finish the login process
if (params.code) {
  setParams(omit(params, 'code'))
  user.finishLogin(params.code)
}

// Show administrator elements if/when logged in and a collaborator
const adminOnlyEls = $('.admin-only')
if (user.username && user.isCollaborator) adminOnlyEls.show()
user.on('change', (changedUser) => {
  if (changedUser.username && changedUser.isCollaborator) adminOnlyEls.show()
})

// Check for these components on the page and initialize them
const components = [
  {tag: 'navigation', class: Navigation},
  {tag: 'form', class: Form},
  {tag: 'subject-form', class: SubjectForm},
  {tag: 'admin-form', class: AdminForm},
  {tag: 'categories-form', class: CategoriesForm},
  {tag: 'licenses-form', class: LicensesForm},
  {tag: 'subject-display', class: SubjectDisplay},
  {tag: 'delete-page-button', class: DeletePageButton},
  {tag: 'editable-list', class: EditableList},
  {tag: 'view-switcher', class: ViewSwitcher},
  {tag: 'theme-gallery', class: ThemeGallery},
  {tag: 'subjects-list', class: SubjectsList, usesSubjects: true},
  {tag: 'categories-filter', class: CategoriesFilter, usesSubjects: true},
  {tag: 'periods-filter', class: PeriodsFilter, usesSubjects: true}
]
for (let component of components) {
  const els = queryByComponent(component.tag)
  if (els.length) {
    // If the component depends on subjects.json, fetch it first (once per page) and pass it
    if (component.usesSubjects) {
      getSubjects().then((subjects) => {
        els.each((index, el) => new component.class({el: $(el), user, params, subjects})) // eslint-disable-line
      })
    // Otherwise simply initialize the component
    } else {
      els.each((index, el) => new component.class({el: $(el), user, params})) // eslint-disable-line
    }
  }
}

// Helper function to ensure subjects.json is only fetched once per page
let subjectsCache
function getSubjects () {
  subjectsCache = subjectsCache || $.getJSON(`${settings.BASE_URL}/subjects.json`)
  return subjectsCache
}
