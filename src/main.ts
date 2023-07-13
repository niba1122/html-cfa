
// dynamic content
document.getElementById('app')!.innerHTML = `
  <h3>list2</h3>
  <ul>
    <li data-b-for="$.table2">
      name: <span data-b-content="$.name"></span>
      sex: <span data-b-content="$.sex"></span>
      job: <span data-b-content="$.job"></span>
      roles:
        <ul>
          <li data-b-for="$.roles">
            <span data-b-content="$"></span>
          </li>
        </ul>
    </li>
  </ul>
`

