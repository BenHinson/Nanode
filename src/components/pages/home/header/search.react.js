import React, {useState} from 'react';

export default function SearchContainer() {
  
  return (
    <span className='searchContainer'>
      <input className='search' type="text" placeholder="Search..."></input>
      <button className='searchControls'>
        <i className="searchParams" title='Search Options'>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" className="active"></path>
          </svg>
        </i>
        <i className="searchSubmit fas fa-search"></i>
      </button>

      <SearchDropdown />
    </span>
  )
}

const SearchDropdown = () => {
  return (
    <div className='searchDropdown'>
      <div className='searchParamsContainer'>
        <div className='searchSelectors'>
          <form>
            <p>Within</p>
            <span><input type="radio" name="searchWithin" value="withinAll"></input> <label>All</label></span>
            <span><input type="radio" name="searchWithin" value="withinParent"></input> <label>Current</label></span>
          </form>
          <form>
            <p>By</p>
            <span><input type="checkbox" name="Colour" value="color" search='ColorSelect'></input> <label>Colour</label></span>
            <span><input type="checkbox" name="Type" value="type" search='TypeSelect'></input> <label>Type</label></span>
          </form>
          <form>
            <p>In Range</p>
            <span><input type="checkbox" name="Date" value="date" search='DateRange'></input> <label>Date</label></span>
            <span><input type="checkbox"name="Size" value="size" search='SizeRange'></input> <label>Size</label></span>
          </form>
          <form>
            <p>For</p>
            <span><input type="checkbox" name="searchFor" value="forFolders"></input> <label>Folders</label></span>
            <span><input type="checkbox" name="searchFor" value="forFiles"></input> <label>Files</label></span>
          </form>
          <form>
            <p>Include</p>
            <span><input type="checkbox" name="Description" value="description"></input> <label>Description</label></span>
            <span><input type="checkbox" name="Previous Names" value="prevNames"></input> <label>Previous Names</label></span>
          </form>
        </div>
        <span className='searchOptionInput'></span>
      </div>

      <div className='searchSuggested'>
        <p>Suggested</p>
        <ul></ul>
      </div>
      <div className='searchResultsContainer'>
        <table className='searchResults tableTemplate'><tbody></tbody></table>
      </div>
    </div>
  )
}