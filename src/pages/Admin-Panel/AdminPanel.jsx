import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { IoMdAddCircleOutline, IoIosPeople } from "react-icons/io";
import { MdEventAvailable, MdOutlineAutorenew } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { CiMemoPad } from "react-icons/ci";
import { BiHistory } from "react-icons/bi";
import { FaFileAlt, FaFileInvoice } from "react-icons/fa";

const AdminPanel = () => {
  return (
    <div className="w-full min-h-screen flex">
      <div className="w-[18%] min-h-screen border-r-2 ">
        {/* left side*/}
        <div className="mt-18 flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
          <NavLink
            className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1"
            to="/admin-panel/add"
          >
            {/*<img className='w-5 h-5' src={} alt="" />*/}
            <IoMdAddCircleOutline />
            <p className="hidden md:block">Add Event</p>
          </NavLink>

          <NavLink
            className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1"
            to="/admin-panel/list"
          >
            {/*<img className='w-5 h-5' src={} alt="" />*/}
            <MdEventAvailable />
            <p className="hidden md:block">List of Events</p>
          </NavLink>

          <NavLink
            className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1"
            to="/admin-panel/members"
          >
            {/*<img className='w-5 h-5' src={} alt="" />*/}
            <IoIosPeople />
            <p className="hidden md:block">Members</p>
          </NavLink>

          <NavLink
            className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1"
            to="/admin-panel/gallery"
          >
            {/*<img className='w-5 h-5' src={} alt="" />*/}
            <MdOutlineAutorenew />
            <p className="hidden md:block">Upload Images</p>
          </NavLink>

          {/* <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1" to="/admin-panel/registration-details">
                
                <MdOutlineAutorenew />
                <p className='hidden md:block'>Registration Details</p>
            </NavLink> */}

          <NavLink
            className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1"
            to="/admin-panel/pad-generation"
          >
            {/*<img className='w-5 h-5' src={} alt="" />*/}
            <CiMemoPad />
            <p className="hidden md:block">Pad Generation</p>
          </NavLink>

          <NavLink
            className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1"
            to="/admin-panel/pad-history"
          >
            {/*<img className='w-5 h-5' src={} alt="" />*/}
            <BiHistory />
            <p className="hidden md:block">Pad History</p>
          </NavLink>

          <NavLink
            className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1"
            to="/admin-panel/create-invoice"
          >
            {/*<img className='w-5 h-5' src={} alt="" />*/}
            <FaFileInvoice />
            <p className="hidden md:block">Create Invoice</p>
          </NavLink>
          <NavLink
            className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1"
            to="/admin-panel/invoice-history"
          >
            {/*<img className='w-5 h-5' src={} alt="" />*/}
            <FaFileAlt />
            <p className="hidden md:block">Invoice History</p>
          </NavLink>

          <NavLink
            className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1"
            to="/admin-panel/settings"
          >
            {/*<img className='w-5 h-5' src={} alt="" />*/}
            <IoSettingsOutline />
            <p className="hidden md:block">Settings</p>
          </NavLink>
        </div>
      </div>

      {/* right side*/}
      <div className="mt-24 w-[70%] mx-auto xl:mx-0 xl:ml-16 text-gray-600 text-base">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPanel;
