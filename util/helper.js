export const formateData = (data) => {
  return data.map((item) => {
    // Split the skills by comma and trim spaces
    item.skills = item.skills.split(", ").map((skill) => skill.trim());
    console.log(item.skills);
    return item;
  });
};
