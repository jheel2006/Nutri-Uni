import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";

const MenuTable = ({ menuItems = [], loading, hideAdminControls }) => {
  const [editRowId, setEditRowId] = useState(null);
  const [editData, setEditData] = useState({ dining_hall: "", counter: "" });

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id);
      alert("Deleted!");
    } catch (err) {
      console.error(err);
      alert("Error deleting item.");
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
    } catch (err) {
      console.error(err);
      alert("Error updating item.");
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
                {!hideAdminControls && <TableHead className="text-center">Actions</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {!loading && menuItems.length > 0 ? (
                menuItems.map((item) => (
                  <TableRow key={item.id} className="h-[90px]">
                    <TableCell className="p-3">
                      <Avatar className="h-12 w-12 rounded-full border">
                        {item.food_info?.item_photo_link ? (
                          <img
                            src={item.food_info.item_photo_link}
                            alt={item.food_info.item_name}
                            className="object-cover w-full h-full rounded-full"
                          />
                        ) : (
                          <div className="bg-white w-full h-full rounded-full" />
                        )}
                      </Avatar>
                    </TableCell>

                    <TableCell>{item.food_info?.item_name || "Unnamed"}</TableCell>

                    <TableCell>{item.dining_hall}</TableCell>

                    <TableCell>{item.counter}</TableCell>

                    {!hideAdminControls && (
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
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    )}
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
