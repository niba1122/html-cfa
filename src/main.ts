
// dynamic content
document.getElementById('app')!.innerHTML = `
  <h3>list2</h3>
  <ul>
    <dxsl-for-each select="$.table2">
      <li>
        name: <dxsl-value-of select="$.name"></dxsl-value-of>
        sex: <dxsl-value-of select="$.sex"></dxsl-value-of>
        job: <dxsl-value-of select="$.job"></dxsl-value-of>
        roles: <dxsl-value-of select="$.roles"></dxsl-value-of>
      </li>
    </dxsl-for-each>
  </ul>
`

