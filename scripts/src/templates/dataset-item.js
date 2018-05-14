export default (data) => (
`<subject>
  <h3><a href="${data.url}">${data.title}</a></h3>
  ${data.notes || ''}
</subject>`
)
