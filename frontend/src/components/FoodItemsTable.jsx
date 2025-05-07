
// File: FoodItemsTable.jsx - to display the food_info table

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import foodPlaceholder from '../assets/food_placeholder.png';
import { useToast } from "@/components/ToastContext";
import ConfirmDialog from "./ConfirmDialogue";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { getFoodItems, deleteFoodItem, updateFoodItem } from "../api/meals";
import { MultiSelect } from "@/components/ui/multiselect";

function FoodItemsTable({ loading, refresh }) {
  const [foodItems, setFoodItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editRowId, setEditRowId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getFoodItems();
        setFoodItems(response.data || []);
      } catch (error) {
        console.error("Error fetching food items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refresh]);

  const handleConfirmDelete = async () => {
    try {
      await deleteFoodItem(deleteId);
      setFoodItems((prev) => prev.filter((item) => item.id !== deleteId));
      setConfirmOpen(false);
      setDeleteId(null);
      if (refresh) refresh();
    } catch (error) {
      console.error("Error deleting:", error);
      showToast("Could not delete item.");
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleEdit = (item) => {
    setEditRowId(item.id);
    setEditData({
      ...item,
      allergens: item.allergens || [],
    });
  };

  const handleSave = async (id) => {
    try {
      const updated = {
        ...editData,
        allergens: editData.allergens,
      };

      await updateFoodItem(id, updated);
      setEditRowId(null);
      if (refresh) refresh();
    } catch (error) {
      console.error("Error saving:", error);
      showToast("Could not update item.");
    }
  };

  const format = (val) => (val ?? "-");

  return (
    <div className="w-full overflow-x-auto">
      <Card className="w-full border border-[#e7e7ed] rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <Table className="w-full table-auto">
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Dietary Restrictions</TableHead>
                <TableHead>Allergens</TableHead>
                <TableHead>Nutrition</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {foodItems.map((item) => (
                <TableRow key={item.id} className="h-[90px]">
                  <TableCell className="p-3">
                    <Avatar className="h-12 w-12 rounded-full border">
                      <img
                        src={item.item_photo_link || foodPlaceholder}
                        alt={item.item_name}
                        className="object-cover w-full h-full rounded-full"
                      />
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {editRowId === item.id ? (
                      <input
                        value={editData.item_name}
                        onChange={(e) =>
                          setEditData({ ...editData, item_name: e.target.value })
                        }
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      item.item_name
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {item.veg && (
                        <Badge className="bg-green-100 text-green-800">Veg</Badge>
                      )}
                      {item.vegan && (
                        <Badge className="bg-green-100 text-green-800">Vegan</Badge>
                      )}
                      {item.gluten_free && (
                        <Badge className="bg-yellow-100 text-yellow-800">GF</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {editRowId === item.id ? (
                      <MultiSelect
                        options={["Eggs", "Milk", "Nuts", "Soy", "Wheat", "Fish"].map((a) => ({
                          label: a,
                          value: a,
                        }))}
                        selected={editData.allergens}
                        onChange={(selected) =>
                          setEditData({ ...editData, allergens: selected })
                        }
                        className="w-full"
                        selectedClassName="bg-[#BDE6EA] text-[#303030] font-semibold"
                      />
                    ) : Array.isArray(item.allergens) && item.allergens.length > 0 ? (
                      item.allergens.join(", ")
                    ) : (
                      "None"
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm leading-5">
                    {editRowId === item.id ? (
                      <div className="flex flex-col gap-1">
                        {["energy", "protein", "fats", "salt", "sugar"].map((key) => (
                          <input
                            key={key}
                            placeholder={key}
                            value={editData[key]}
                            onChange={(e) =>
                              setEditData({ ...editData, [key]: e.target.value })
                            }
                            className="border p-1 rounded w-full"
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        <div>Energy: {format(item.energy)} kcal</div>
                        <div>Protein: {format(item.protein)} g</div>
                        <div>Fats: {format(item.fats)} g</div>
                        <div>Salt: {format(item.salt)} g</div>
                        <div>Sugar: {format(item.sugar)} g</div>
                      </>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-4">
                      {editRowId === item.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSave(item.id)}
                            className="text-green-700 border border-green-700 font-semibold px-4 py-1"
                            variant="outline"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setEditRowId(null)}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            className="text-black"
                          >
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Food Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
      />
    </div>
  );
}

export default FoodItemsTable;
