const sampleData = {
  table1: [
    { name: 'taro', sex: 'male', age: 28 },
    { name: 'hanako', sex: 'female', age: 32 },
    { name: 'mike', sex: 'male', age: 21 },
    { name: 'jane', sex: 'female', age: 25 },
    { name: 'james', sex: 'male', age: 33 },
  ],
  table2: [
    { name: 'yamada', sex: 'male', job: 'engineer', roles: ['manager', 'engineer'] },
    { name: 'suzuki', sex: 'female', job: 'designer', roles: ['head', 'designer'] },
    { name: 'sato', sex: 'male', job: 'sales', roles: ['sub'] },
    { name: 'tanaka', sex: 'female', job: 'researcher', roles: [] },
  ],
  table3: [
    { name: 'a', imageUrl: 'https://cdn.goope.jp/45227/161123133219uvsp_l.jpg' },
    { name: 'b', imageUrl: 'https://cdn.goope.jp/45227/161123133242xhrd_l.jpg' },
    { name: 'c', imageUrl: 'https://cdn.goope.jp/45227/161123133257tc3t_l.jpg' },
    { name: 'd', imageUrl: 'https://cdn.goope.jp/45227/161123133322kjgc_l.jpg' },
    { name: 'e', imageUrl: 'https://cdn.goope.jp/45227/161123133340ta2s_l.jpg' },
  ],
  tableGroup1: {
    fruits: [
      {
        name: 'orange',
      },
      {
        name: 'apple',
      },
      {
        name: 'grape',
      },
    ],
    animals: [
      {
        name: 'cat',
      },
      {
        name: 'dog',
      },
      {
        name: 'bear',
      },
      {
        name: 'rabbit',
      },
    ]
  },
}

window.dispatchEvent(new CustomEvent('b:set-data', {
  detail: {
    data: sampleData,
  },
}));


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

