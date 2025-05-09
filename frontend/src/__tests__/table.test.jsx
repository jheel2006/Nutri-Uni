import {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
  } from "@/components/ui/table";
  import { render, screen } from "@testing-library/react";
  import { describe, it, expect } from "vitest";
  import React from "react";
  
  describe("Table Components", () => {
    it("renders Table with children", () => {
      render(
        <Table>
          <caption>Test Table</caption>
        </Table>
      );
      expect(screen.getByText("Test Table")).toBeInTheDocument();
    });
  
    it("renders TableHeader", () => {
      render(
        <table>
          <TableHeader>
            <tr><th>Header</th></tr>
          </TableHeader>
        </table>
      );
      expect(screen.getByText("Header")).toBeInTheDocument();
    });
  
    it("renders TableBody", () => {
      render(
        <table>
          <TableBody>
            <tr><td>Body Cell</td></tr>
          </TableBody>
        </table>
      );
      expect(screen.getByText("Body Cell")).toBeInTheDocument();
    });
  
    it("renders TableFooter", () => {
      render(
        <table>
          <TableFooter>
            <tr><td>Footer</td></tr>
          </TableFooter>
        </table>
      );
      expect(screen.getByText("Footer")).toBeInTheDocument();
    });
  
    it("renders TableRow", () => {
      render(
        <table>
          <tbody>
            <TableRow>
              <td>Row Data</td>
            </TableRow>
          </tbody>
        </table>
      );
      expect(screen.getByText("Row Data")).toBeInTheDocument();
    });
  
    it("renders TableHead", () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead>Heading</TableHead>
            </tr>
          </thead>
        </table>
      );
      expect(screen.getByText("Heading")).toBeInTheDocument();
    });
  
    it("renders TableCell", () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell>Cell Content</TableCell>
            </tr>
          </tbody>
        </table>
      );
      expect(screen.getByText("Cell Content")).toBeInTheDocument();
    });
  
    it("renders TableCaption", () => {
      render(
        <table>
          <TableCaption>My Caption</TableCaption>
        </table>
      );
      expect(screen.getByText("My Caption")).toBeInTheDocument();
    });
  });
  