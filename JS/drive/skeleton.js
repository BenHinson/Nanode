const Skeleton = () => {

  Skeleton.Homepage = () => {
    return `
      <div class='skeleton'>
        ${Skeleton.BaseFolders()}
        ${Skeleton.Recents()}
        ${Skeleton.Table()}
        </div>
        `
      }
    // ${Settings?.Local?.recents === 1 ? Skeleton.Recents() : ''}

  Skeleton.BaseFolders = () => {
    return `
      <div class='skeleton-basefolders flex-even-cent'>
        ${Array(5).fill().reduce((pre, repeat) => pre + `
          <div class="skeleton-load">
            <p class="skeleton-img"></p>
          </div>
        `, '')}
      </div>
    `
  }

  Skeleton.Recents = () => {
    return `
    <div class='skeleton-recents flex-even-cent'>
      ${Array(5).fill().reduce((pre, repeat) => pre + `
        <div class="skeleton-load"></div>
      `, '')}
    </div>`
  }

  Skeleton.Table = () => {
    return `
      <div class='skeleton'>
        <div>
          <table class='skeleton-table'>
            <thead>
              <tr>
                <th> <p class='skeleton-text' style='width:200%;'></p> </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${[60,40,65,80,45,60,50].reduce((pre, percentage) => pre + `
              <tr class='skeleton-load'>
                <td> <p class='skeleton-img'></p> </td>
                <td> <p class='skeleton-text' style='width:${percentage}%;'></p> </td>
              </tr>
            `, '')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

}
Skeleton();