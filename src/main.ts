
// dynamic content
document.getElementById('app')!.innerHTML = `
  <h3>list2</h3>
  <ul>
    <dxsl-for-each match="/table2">
      <li>
        name: <dxsl-value-of key="name"></dxsl-value-of>
        sex: <dxsl-value-of key="sex"></dxsl-value-of>
        job: <dxsl-value-of key="job"></dxsl-value-of>
      </li>
    </dxsl-for-each>
  </ul>
`

