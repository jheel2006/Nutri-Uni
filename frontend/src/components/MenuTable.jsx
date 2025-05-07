// MenuTable.jsx - to display the week menu items in a table format
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import foodPlaceholder from "../assets/food_placeholder.png";
import { useToast } from "@/components/ToastContext";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { deleteMenuItem, updateMenuItem } from "../api/meals";

const MenuTable = ({ menuItems = [], loading, refresh }) => {
  const [editRowId, setEditRowId] = useState(null);
  const [editData, setEditData] = useState({ dining_hall: "", counter: "" });
  const { showToast } = useToast();

  const groupedMenuItems = [];

  menuItems.forEach((item) => {
    const existing = groupedMenuItems.find(
      (entry) =>
        entry.food_info?.id === item.food_info?.id &&
        entry.dining_hall === item.dining_hall &&
        entry.counter === item.counter
    );

    if (existing) {
      if (!existing.days.includes(item.day)) {
        existing.days.push(item.day);
      }
      existing.ids.push(item.id);
    } else {
      groupedMenuItems.push({
        ...item,
        days: [item.day],
        ids: [item.id],
      });
    }
  });

  const dayOrder = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  groupedMenuItems.forEach((item) => {
    item.days.sort((a, b) => dayOrder[a] - dayOrder[b]);
  });

  const handleDelete = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteMenuItem(id)));
      showToast("Deleted from all selected days!");
      refresh();
    } catch (err) {
      console.error(err);
      showToast("Error deleting item.");
    }
  };

  const handleEdit = (item) => {
    setEditRowId(item.id);
    setEditData({ dining_hall: item.dining_hall, counter: item.counter });
  };

  const handleSave = async (id) => {
    try {
      await updateMenuItem(id, editData);
      setEditRowId(null);
      refresh();
    } catch (err) {
      console.error(err);
      showToast("Error updating item.");
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <Card className="w-full border border-[#e7e7ed] rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <Table className="w-full table-auto">
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Dining Hall</TableHead>
                <TableHead>Counter</TableHead>
                <TableHead>Day</TableHead>

                {/* <TableHead>Status</TableHead> */}
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!loading && groupedMenuItems.length > 0 ? (
                groupedMenuItems.map((item) => (
                  <TableRow key={item.ids[0]} className="h-[90px]">
                    <TableCell className="p-3">
                      <Avatar className="h-12 w-12 rounded-full border">
                        <img
                          src={item.food_info?.item_photo_link || foodPlaceholder}
                          alt={item.food_info?.item_name || "Food item"}
                          className="object-cover w-full h-full rounded-full"
                        />
                      </Avatar>
                    </TableCell>

                    <TableCell>{item.food_info?.item_name || "Unnamed"}</TableCell>

                    <TableCell>
                      {editRowId === item.ids[0] ? (
                        <input
                          className="border p-1 rounded w-28"
                          value={editData.dining_hall}
                          onChange={(e) =>
                            setEditData({ ...editData, dining_hall: e.target.value })
                          }
                        />
                      ) : (
                        item.dining_hall
                      )}
                    </TableCell>

                    <TableCell>
                      {editRowId === item.ids[0] ? (
                        <input
                          className="border p-1 rounded w-28"
                          value={editData.counter}
                          onChange={(e) =>
                            setEditData({ ...editData, counter: e.target.value })
                          }
                        />
                      ) : (
                        item.counter
                      )}
                    </TableCell>

                    {/* <TableCell>
                      <Badge className="bg-transparent text-[#95ae45] font-bold">
                        In Stock
                      </Badge>
                    </TableCell> */}
                    <TableCell>
                      {item.days?.join(", ")}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-4">
                        {editRowId === item.ids[0] ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSave(item.ids[0])}
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
                          <Button
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            className="text-black"
                          >
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(item.ids)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    {loading ? "Loading..." : "No menu items found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuTable;