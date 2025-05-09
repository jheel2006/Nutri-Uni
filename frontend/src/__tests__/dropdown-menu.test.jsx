import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuPortal,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../components/ui/dropdown-menu"; 

describe("DropdownMenu - Full Coverage", () => {
  test("opens menu and shows items", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="dropdown-trigger">Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>View</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByTestId("dropdown-trigger")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("dropdown-trigger"));
    expect(screen.getByText("View")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  test("renders CheckboxItem and RadioItem inside a menu context", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={true}>Enable Notifications</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="dark">
            <DropdownMenuRadioItem value="light">Light Mode</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark Mode</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await userEvent.click(screen.getByText("Toggle"));
    expect(screen.getByText("Enable Notifications")).toBeInTheDocument();
    expect(screen.getByText("Light Mode")).toBeInTheDocument();
    expect(screen.getByText("Dark Mode")).toBeInTheDocument();
  });

  test("renders group, separator, and shortcuts", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Options</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Copy <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Paste <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await userEvent.click(screen.getByText("Options"));
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(screen.getByText("Paste")).toBeInTheDocument();
    expect(screen.getByText("⌘C")).toBeInTheDocument();
    expect(screen.getByText("⌘V")).toBeInTheDocument();
  });

  test("renders submenu and reveals nested items", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Nested Option</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await userEvent.click(screen.getByText("Open"));
    await userEvent.hover(screen.getByText("More"));
    expect(await screen.findByText("Nested Option")).toBeInTheDocument();
  });

  test("renders content through DropdownMenuPortal (indirect)", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Portal Trigger</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Portal Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await userEvent.click(screen.getByText("Portal Trigger"));
    expect(screen.getByText("Portal Item")).toBeInTheDocument();
  });
});
