import React from "react";

function Input({ name, state, setState, label = false }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="text-teal-light text-sm md:text-base px-1">
          {name}
        </label>
      )}
      <input
        type="text"
        name={name}
        value={state}
        onChange={(e) => setState(e.target.value)}
        className="bg-input-background p-2 rounded-lg w-full text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-teal-light"
      />
    </div>
  );
}

export default Input;
