import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import React from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import { BsFilter } from "react-icons/bs";

function SearchBar() {
  const [{ contactSearch }, dispatch] = useStateProvider();

  return (
    <div className="bg-search-input-container-background flex items-center gap-3 h-14 py-2 px-4 sm:px-5">
      {/* 🔍 Search Input Container */}
      <div className="bg-panel-header-background flex items-center gap-3 px-3 py-1 rounded-lg flex-grow">
        <BiSearchAlt2
          className="text-panel-header-icon text-xl cursor-pointer"
          aria-label="Search Icon"
        />
        <input
          type="text"
          placeholder="Search or start a new chat"
          className="bg-transparent text-sm text-white focus:outline-none w-full"
          value={contactSearch}
          onChange={(e) =>
            dispatch({
              type: reducerCases.SET_CONTACT_SEARCH,
              contactSearch: e.target.value,
            })
          }
          aria-label="Search Contacts"
        />
      </div>

      {/* 🧹 Filter Icon */}
      <div className="pl-2 pr-2 sm:pr-4">
        <BsFilter className="text-panel-header-icon text-xl cursor-pointer" aria-label="Filter" />
      </div>
    </div>
  );
}

export default SearchBar;
