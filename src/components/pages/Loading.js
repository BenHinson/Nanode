export default PageLoading = () => {
  return (
      <section className="Page_Loading">
        <div>
          <div className='pageHeader'></div>
          <div className='pageData'>
            <svg className='Loading_SVG medium' title='Loading' viewBox='0 0 100 100' xmlns='https://www.w3.org/2000/svg'>
              <circle cx='50' cy='50' r='45'></circle>
            </svg>
          </div>
        </div>
      </section>
  )
}