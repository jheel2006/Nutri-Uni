// UserProfile.jsx - to display and (edit preferences) user profile information
// different for admins and students

import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getStudentInfo, updatePreferences } from "../api/students";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import { MultiSelect } from "@/components/ui/multiselect";
import { UserButton } from "@clerk/clerk-react";
import { useToast } from "@/components/ToastContext";


const dietaryOptions = [
  { label: "Vegetarian", value: "is_veg" },
  { label: "Vegan", value: "is_vegan" },
  { label: "Gluten Free", value: "is_gluten_free" },
];

const allergyOptions = ["Eggs", "Milk", "Nuts", "Soy", "Wheat", "Fish"];

export default function UserProfile({ onBack, isAdmin = false }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [preferences, setPreferences] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setName(user.fullName || "");
      setEmail(user.primaryEmailAddress?.emailAddress || "");

      try {
        const res = await getStudentInfo(user.id);
        const data = res.data || {};

        const selectedPrefs = dietaryOptions
          .filter((opt) => data[opt.value])
          .map((opt) => opt.value);

        setPreferences(selectedPrefs);
        setAllergies(data.allergens || []);
      } catch (err) {
        console.error("Failed to fetch student info", err);
      }
    };

    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);

    const prefsToUpdate = {
      is_veg: preferences.includes("is_veg"),
      is_vegan: preferences.includes("is_vegan"),
      is_gluten_free: preferences.includes("is_gluten_free"),
      allergens: allergies,
    };

    try {
      await updatePreferences(user.id, prefsToUpdate);
      showToast("Preferences saved successfully.");
    } catch (err) {
      console.error("Error saving preferences:", err);
      showToast("Failed to save. Please try again.");
    }

    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto pt-6 px-6 rounded-xl mt-15">
      <div className="flex items-center mb-15">
        <ChevronLeft
          className="cursor-pointer text-gray-600"
          onClick={onBack}
        />
        <h1 className="text-3xl ml-3">Profile</h1>
      </div>

      <div className="flex justify-center my-6 mb-20">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "transform scale-[3.5]",
            },
          }}
        />
      </div>

      <div
        className={`${
          isAdmin
            ? "flex flex-col items-center justify-center space-y-4 mt-6"
            : "grid grid-cols-1 md:grid-cols-2 gap-6"
        }`}
      >
        <div className="space-y-4">
          <div>
            <label className="text-lg font-medium text-gray-700">Full Name</label>
            <Input
              value={name}
              disabled
              className={`bg-[#ebf6f7] border-none mt-1 ${
                isAdmin ? "w-80" : "w-full"
              }`}
            /> 
          </div>

          <div>
            <label className="text-lg font-medium text-gray-700">Email</label>
            <Input
              value={email}
              disabled
              className="bg-[#ebf6f7] border-none mt-1"
            />
          </div>
        </div>

        {!isAdmin && (
          <div className="space-y-4">
            <div>
              <label className="text-lg font-medium text-gray-700">
                Dietary Preference(s)
              </label>
              <MultiSelect
                options={dietaryOptions.map((o) => ({
                  label: o.label,
                  value: o.value,
                }))}
                selected={preferences}
                onChange={setPreferences}
                className="mt-1"
                selectedClassName="bg-[#BDE6EA] text-[#303030] font-semibold"
              />
            </div>

            <div>
              <label className="text-lg font-medium text-gray-700">Allergies</label>
              <MultiSelect
                options={allergyOptions.map((a) => ({
                  label: a,
                  value: a,
                }))}
                selected={allergies}
                onChange={setAllergies}
                className="mt-1"
                selectedClassName="bg-[#BDE6EA] text-[#303030] font-semibold"
              />
            </div>
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="mt-10 flex justify-center">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#95ae45] text-white rounded-md px-6 py-2 hover:bg-[#7c9438]"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}
